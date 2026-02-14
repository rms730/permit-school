import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, course_code, priceId: explicitPriceId } = body ?? {};

    if (!explicitPriceId && !course_id && !course_code) {
      return NextResponse.json(
        { error: 'Missing priceId or course_id or course_code' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });

    let priceId = explicitPriceId;

    // Resolve price from course if not explicitly provided.
    if (!priceId) {
      // Get course ID if not provided
      let courseId = course_id;
      if (!courseId) {
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('id')
          .eq('code', course_code)
          .limit(1)
          .single();

        if (courseError || !course) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        courseId = course.id;
      }

      // Get price from billing_prices table
      const { data: price } = await supabase
        .from('billing_prices')
        .select('stripe_price_id')
        .eq('course_id', courseId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      priceId = price?.stripe_price_id;
    }

    if (!priceId) {
      // Final fallback to environment variable.
      priceId = process.env.STRIPE_PRICE_ID;
    }

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
