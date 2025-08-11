import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getRateLimitHeaders, getRateLimitKey } from '@/lib/ratelimit';
import { sendSubscriptionActiveEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  // Rate limiting (skip for Stripe webhooks)
  const stripeSignature = request.headers.get('stripe-signature');
  if (!stripeSignature) {
    const rateLimitEnabled = process.env.RATE_LIMIT_ON === 'true';
    if (rateLimitEnabled) {
      const key = getRateLimitKey(request);
      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
      const max = parseInt(process.env.RATE_LIMIT_MAX || '60');
      
      const result = rateLimit(key, windowMs, max);
      const headers = getRateLimitHeaders(result);
      
      if (!result.ok) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429, headers }
        );
      }
      
      // Add rate limit headers to successful response
      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const adminSupabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!customerId || !subscriptionId) {
          console.error('Missing customer or subscription ID in checkout session');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer.deleted) {
          console.error('Customer was deleted');
          break;
        }
        
        const userId = customer.metadata?.user_id;

        if (!userId) {
          console.error('Missing user_id in customer metadata');
          break;
        }

        // Upsert billing_customers
        await adminSupabase
          .from('billing_customers')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
          });

        // For checkout.session.completed, we'll get subscription details later
        // when the subscription events come in

        // Log event
        await adminSupabase
          .from('billing_events')
          .insert({
            user_id: userId,
            event_type: event.type,
            payload: event.data.object,
          });

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer.deleted) {
          console.error('Customer was deleted');
          break;
        }
        
        const userId = customer.metadata?.user_id;

        if (!userId) {
          console.error('Missing user_id in customer metadata');
          break;
        }

        // Upsert subscription
        await adminSupabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_end: new Date((subscription as any).current_period_end * 1000),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          });

        // Update entitlement
        const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status);
        await adminSupabase
          .from('entitlements')
          .upsert({
            user_id: userId,
            j_code: 'CA',
            active: isActive,
            expires_at: isActive ? new Date((subscription as any).current_period_end * 1000) : null,
            updated_at: new Date(),
          });

        // Send subscription active email for new subscriptions
        if (event.type === 'customer.subscription.created' && isActive) {
          try {
            // Get user email
            const { data: user } = await adminSupabase.auth.admin.getUserById(userId);
            if (user?.user?.email) {
              await sendSubscriptionActiveEmail({
                to: user.user.email,
                name: user.user.user_metadata?.full_name,
              });
            }
          } catch (emailError) {
            console.error('Failed to send subscription email:', emailError);
          }
        }

        // Log event
        await adminSupabase
          .from('billing_events')
          .insert({
            user_id: userId,
            event_type: event.type,
            payload: event.data.object,
          });

        break;
      }

      default:
        // Log unhandled events
        await adminSupabase
          .from('billing_events')
          .insert({
            event_type: event.type,
            payload: event.data.object,
          });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
