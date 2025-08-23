import { NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET() {
  try {
    const supabase = await getRouteClient();

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get latest billing events
    const { data: events, error: eventsError } = await supabase
      .from('billing_events')
      .select('id, event_type, created_at, user_id, metadata')
      .order('created_at', { ascending: false })
      .limit(50);

    if (eventsError) {
      console.error('Failed to fetch billing events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch billing events', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(events || []);

  } catch (error) {
    console.error('Billing events error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
