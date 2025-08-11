import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRouteClient } from '@/lib/supabaseRoute';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil',
    });

    const priceId = process.env.STRIPE_PRICE_ID;
    const successUrl = process.env.BILLING_SUCCESS_URL;
    const cancelUrl = process.env.BILLING_CANCEL_URL;

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 400 });
    }

    // Ensure billing customer exists
    const adminSupabase = getSupabaseAdmin();
    let { data: customer } = await adminSupabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!customer) {
      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      // Insert into billing_customers
      await adminSupabase
        .from('billing_customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomer.id,
        });

      customer = { stripe_customer_id: stripeCustomer.id };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.stripe_customer_id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
