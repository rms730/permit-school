import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getPayments } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, j_code, course_code } = body;

    if (!course_id && (!j_code || !course_code)) {
      return NextResponse.json({ error: 'Missing course_id or j_code/course_code' }, { status: 400 });
    }

    const payments = await getPayments();

    // Get course ID if not provided
    let courseId = course_id;
    if (!courseId) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('code', course_code)
        .eq('jurisdictions.code', j_code)
        .single();

      if (courseError || !course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      courseId = course.id;
    }

    // Get price from billing_prices table
    const { data: price, error: priceError } = await supabase
      .from('billing_prices')
      .select('stripe_price_id')
      .eq('course_id', courseId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let priceId = price?.stripe_price_id;
    if (!priceId) {
      // Fallback to environment variable
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
      // For mock mode, create a fake customer ID
      const customerId = process.env.STRIPE_ENABLED === 'true' ? 
        'cus_mock_' + Date.now() : 
        'cus_mock_' + Date.now();

      // Insert into billing_customers
      await adminSupabase
        .from('billing_customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId,
        });

      customer = { stripe_customer_id: customerId };
    }

    // Create checkout session
    const session = await payments.createCheckoutSession({
      userId: user.id,
      courseId: courseId,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      priceId: priceId,
      metadata: {
        course_id: courseId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
