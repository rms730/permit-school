import { NextRequest, NextResponse } from 'next/server';

import { getJurisdictionConfig } from '@/lib/jurisdictionConfig';
import { getRouteClient } from '@/lib/supabaseRoute';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getRouteClient();
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

    // Check profile completeness
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ eligible: false, reason: 'profile_incomplete' });
    }

    // Check required profile fields
    const requiredFields = ['first_name', 'last_name', 'dob', 'address_line1', 'city', 'state', 'postal_code'];
    const missingFields = requiredFields.filter(field => !profile[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        eligible: false, 
        reason: 'profile_incomplete',
        missing_fields: missingFields
      });
    }

    // Check terms and privacy acceptance
    if (!profile.terms_accepted_at || !profile.privacy_accepted_at) {
      return NextResponse.json({ 
        eligible: false, 
        reason: 'profile_incomplete',
        missing_fields: [
          ...(!profile.terms_accepted_at ? ['terms_accepted'] : []),
          ...(!profile.privacy_accepted_at ? ['privacy_accepted'] : [])
        ]
      });
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

    // Check if minor and guardian consent required
    const dob = new Date(profile.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const isMinor = age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate());

    if (isMinor) {
      // Check for verified guardian consent for the course
      const { data: guardianStatus } = await supabase
        .from('v_guardian_latest')
        .select('status')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .single();

      if (!guardianStatus || guardianStatus.status !== 'verified') {
        return NextResponse.json({ 
          eligible: false, 
          reason: 'guardian_consent_required',
          is_minor: true,
          missing: ['guardian_consent']
        });
      }
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
