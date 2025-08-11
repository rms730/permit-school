import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getRateLimitHeaders, getRateLimitKey } from '@/lib/ratelimit';
import { 
  sendSubscriptionActiveEmail, 
  sendPaymentFailedEmail, 
  sendPaymentSucceededEmail 
} from '@/lib/email';
import { notifyStudent } from '@/lib/notify';

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

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

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

        // Get subscription details
        const { data: subscription } = await adminSupabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        // Upsert invoice
        await adminSupabase
          .from('billing_invoices')
          .upsert({
            user_id: userId,
            stripe_invoice_id: invoice.id,
            subscription_id: subscription?.id,
            status: invoice.status,
            amount_due_cents: invoice.amount_due,
            amount_paid_cents: invoice.amount_paid,
            currency: invoice.currency,
            hosted_invoice_url: invoice.hosted_invoice_url || null,
            pdf_url: invoice.invoice_pdf || null,
            period_start: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
            period_end: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
          });

        // Update dunning state
        const { data: dunning } = await adminSupabase
          .from('billing_dunning')
          .select('state, fail_count')
          .eq('user_id', userId)
          .single();

        const currentState = dunning?.state || 'none';
        const failCount = (dunning?.fail_count || 0) + 1;
        
        let newState: 'none' | 'email_1' | 'email_2' | 'email_3' | 'canceled' = 'email_1';
        let nextActionAt: Date | null = null;

        if (currentState === 'none') {
          newState = 'email_1';
          nextActionAt = new Date(Date.now() + (parseInt(process.env.DUNNING_EMAIL_DAY_2 || '3') * 24 * 60 * 60 * 1000));
        } else if (currentState === 'email_1') {
          newState = 'email_2';
          nextActionAt = new Date(Date.now() + (parseInt(process.env.DUNNING_EMAIL_DAY_3 || '7') * 24 * 60 * 60 * 1000));
        } else if (currentState === 'email_2') {
          newState = 'email_3';
          nextActionAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
        } else if (currentState === 'email_3') {
          newState = 'canceled';
          nextActionAt = null;
        }

        await adminSupabase
          .from('billing_dunning')
          .upsert({
            user_id: userId,
            state: newState,
            fail_count: failCount,
            last_failed_at: new Date(),
            last_notified_at: new Date(),
            next_action_at: nextActionAt,
          });

        // Send immediate email if this is the first failure
        if (currentState === 'none') {
          try {
            const { data: user } = await adminSupabase.auth.admin.getUserById(userId);
            if (user?.user?.email) {
              await sendPaymentFailedEmail({
                to: user.user.email,
                name: user.user.user_metadata?.full_name,
                amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
                step: 1,
              });
            }
          } catch (emailError) {
            console.error('Failed to send payment failed email:', emailError);
          }
        }

        // Create notification
        try {
          await notifyStudent(userId, 'payment_failed', {
            amount: invoice.amount_due,
            invoice_id: invoice.id,
          });
        } catch (notificationError) {
          console.error('Failed to create payment failed notification:', notificationError);
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

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

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

        // Get subscription details
        const { data: subscription } = await adminSupabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        // Upsert invoice as paid
        await adminSupabase
          .from('billing_invoices')
          .upsert({
            user_id: userId,
            stripe_invoice_id: invoice.id,
            subscription_id: subscription?.id,
            status: invoice.status,
            amount_due_cents: invoice.amount_due,
            amount_paid_cents: invoice.amount_paid,
            currency: invoice.currency,
            hosted_invoice_url: invoice.hosted_invoice_url || null,
            pdf_url: invoice.invoice_pdf || null,
            period_start: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
            period_end: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
          });

        // Reset dunning state
        await adminSupabase
          .from('billing_dunning')
          .upsert({
            user_id: userId,
            state: 'none',
            fail_count: 0,
            last_failed_at: null,
            last_notified_at: new Date(),
            next_action_at: null,
          });

        // Send success email
        try {
          const { data: user } = await adminSupabase.auth.admin.getUserById(userId);
          if (user?.user?.email) {
            await sendPaymentSucceededEmail({
              to: user.user.email,
              name: user.user.user_metadata?.full_name,
            });
          }
        } catch (emailError) {
          console.error('Failed to send payment succeeded email:', emailError);
        }

        // Create notification
        try {
          await notifyStudent(userId, 'payment_succeeded', {
            amount: invoice.amount_paid,
            invoice_id: invoice.id,
          });
        } catch (notificationError) {
          console.error('Failed to create payment succeeded notification:', notificationError);
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

        // Update entitlement based on status
        let isActive = false;
        if (['active', 'trialing'].includes(subscription.status)) {
          isActive = true;
        } else if (subscription.status === 'past_due') {
          // Check if we should revoke access based on dunning state
          const { data: dunning } = await adminSupabase
            .from('billing_dunning')
            .select('state')
            .eq('user_id', userId)
            .single();
          
          // Only keep active if not in final dunning states
          isActive = !['email_3', 'canceled'].includes(dunning?.state || 'none');
        }

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

        // Create notification for subscription changes
        try {
          if (event.type === 'customer.subscription.deleted') {
            await notifyStudent(userId, 'subscription_canceled', {
              subscription_id: subscription.id,
            });
          }
        } catch (notificationError) {
          console.error('Failed to create subscription notification:', notificationError);
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
