import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';
import { getJurisdictionConfig } from '@/lib/jurisdictionConfig';

export async function GET(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ eligible: false, reason: 'auth' });
    }

    // Check entitlement
    const { data: entitlement, error: entitlementError } = await supabase
      .from('v_user_entitlements')
      .select('active')
      .eq('user_id', user.id)
      .eq('j_code', 'CA')
      .single();

    if (entitlementError || !entitlement || !entitlement.active) {
      return NextResponse.json({ eligible: false, reason: 'entitlement' });
    }

    // Get course ID for DE-ONLINE
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('code', 'DE-ONLINE')
      .single();

    if (courseError || !course) {
      return NextResponse.json({ eligible: false, reason: 'course_not_found' });
    }

    // Check seat time
    const { data: seatTime, error: seatTimeError } = await supabase
      .from('v_course_seat_time')
      .select('minutes_total')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .single();

    // Get jurisdiction config
    const config = await getJurisdictionConfig('CA');
    const minutesTotal = seatTime?.minutes_total || 0;

    if (seatTimeError || minutesTotal < config.seat_time_required_minutes) {
      return NextResponse.json({
        eligible: false,
        reason: 'seat-time',
        minutesTotal,
        minutesRequired: config.seat_time_required_minutes
      });
    }

    return NextResponse.json({ eligible: true });
  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json({ eligible: false, reason: 'error' }, { status: 500 });
  }
}
