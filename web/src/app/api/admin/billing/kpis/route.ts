import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get active subscriptions
    const { count: activeSubscriptions, error: activeError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    if (activeError) {
      console.error('Error counting active subscriptions:', activeError);
      return NextResponse.json({ error: 'Failed to count active subscriptions' }, { status: 500 });
    }

    // Get past due subscriptions
    const { count: pastDueSubscriptions, error: pastDueError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'past_due');

    if (pastDueError) {
      console.error('Error counting past due subscriptions:', pastDueError);
      return NextResponse.json({ error: 'Failed to count past due subscriptions' }, { status: 500 });
    }

    // Calculate churn rates (simplified - in production you'd want more sophisticated logic)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: canceledLast30Days, error: canceledError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('updated_at', thirtyDaysAgo.toISOString());

    if (canceledError) {
      console.error('Error counting canceled subscriptions:', canceledError);
      return NextResponse.json({ error: 'Failed to count canceled subscriptions' }, { status: 500 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: canceledLast7Days, error: canceled7Error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('updated_at', sevenDaysAgo.toISOString());

    if (canceled7Error) {
      console.error('Error counting canceled subscriptions (7 days):', canceled7Error);
      return NextResponse.json({ error: 'Failed to count canceled subscriptions' }, { status: 500 });
    }

    // Calculate MRR (Monthly Recurring Revenue) - simplified
    // In production, you'd want to get this from actual billing data
    const mrr = (activeSubscriptions || 0) * 9.99; // Assuming $9.99 per subscription

    // Calculate churn rates
    const churn30d = activeSubscriptions ? ((canceledLast30Days || 0) / activeSubscriptions) * 100 : 0;
    const churn7d = activeSubscriptions ? ((canceledLast7Days || 0) / activeSubscriptions) * 100 : 0;

    return NextResponse.json({
      active_subscriptions: activeSubscriptions || 0,
      past_due_subscriptions: pastDueSubscriptions || 0,
      churn_7d: Math.round(churn7d * 100) / 100,
      churn_30d: Math.round(churn30d * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
    });
  } catch (error) {
    console.error('Billing KPIs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
