import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendCancelConfirmationEmail } from '@/lib/email';
import { notifyStudent } from '@/lib/notify';
import { getPayments } from '@/lib/payments';

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

    if (subscription.cancel_at_period_end) {
      return NextResponse.json({ error: 'Subscription is already scheduled for cancellation' }, { status: 400 });
    }

    const payments = await getPayments();

    // Cancel at period end
    await payments.cancelSubscription({
      subscriptionId: subscription.stripe_subscription_id,
    });

    // Update local subscription
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
      })
      .eq('user_id', user.id);

    // Send confirmation email
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(user.id);
      if (userData?.user?.email) {
        await sendCancelConfirmationEmail({
          to: userData.user.email,
          name: userData.user.user_metadata?.full_name,
          endDate: subscription.current_period_end,
        });
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    // Create notification
    try {
      await notifyStudent(user.id, 'subscription_canceled', {
        end_date: subscription.current_period_end,
      });
    } catch (notificationError) {
      console.error('Failed to create cancellation notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled at period end',
      current_period_end: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
