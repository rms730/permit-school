import { NextRequest, NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await getRouteClient();
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

    // Get past due users with dunning information
    const { data: pastDueUsers, error: pastDueError } = await supabase
      .from('subscriptions')
      .select(`
        user_id,
        status,
        current_period_end,
        billing_dunning!inner(
          state,
          fail_count,
          last_failed_at
        ),
        profiles!inner(
          email,
          full_name
        )
      `)
      .eq('status', 'past_due')
      .order('current_period_end', { ascending: true });

    if (pastDueError) {
      console.error('Error fetching past due users:', pastDueError);
      return NextResponse.json({ error: 'Failed to fetch past due users' }, { status: 500 });
    }

    // Calculate days overdue and format data
    const now = new Date();
    const formattedUsers = (pastDueUsers || []).map(user => {
      const periodEnd = new Date(user.current_period_end);
      const daysOverdue = Math.floor((now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        user_id: user.user_id,
        email: user.profiles[0]?.email || 'Unknown',
        full_name: user.profiles[0]?.full_name || 'Unknown',
        subscription_status: user.status,
        last_failed_at: user.billing_dunning[0]?.last_failed_at,
        dunning_state: user.billing_dunning[0]?.state,
        fail_count: user.billing_dunning[0]?.fail_count,
        days_overdue: Math.max(0, daysOverdue),
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error('Past due users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
