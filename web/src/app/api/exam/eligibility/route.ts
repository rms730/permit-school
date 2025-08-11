import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';

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

    const minutesRequired = parseInt(process.env.FINAL_EXAM_MINUTES_REQUIRED || '150');
    const minutesTotal = seatTime?.minutes_total || 0;

    if (seatTimeError || minutesTotal < minutesRequired) {
      return NextResponse.json({
        eligible: false,
        reason: 'seat-time',
        minutesTotal,
        minutesRequired
      });
    }

    return NextResponse.json({ eligible: true });
  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json({ eligible: false, reason: 'error' }, { status: 500 });
  }
}
