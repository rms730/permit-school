import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    if (!subscription.cancel_at_period_end) {
      return NextResponse.json({ error: 'Subscription is not scheduled for cancellation' }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil',
    });

    // Resume subscription in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update local subscription
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully',
      current_period_end: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
