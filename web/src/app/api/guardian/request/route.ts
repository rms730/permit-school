import { NextRequest, NextResponse } from 'next/server';

import { sendGuardianRequestEmail } from '@/lib/email';
import { generateToken, hashToken } from '@/lib/tokens';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getRouteClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ code: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }

    const body: any = await request.json();
    const { course_id, j_code, course_code, guardian_name, guardian_email } = body;

    // Validate required fields
    if (!guardian_name || !guardian_email) {
      return NextResponse.json({ code: 'validation_error', message: 'Guardian name and email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardian_email)) {
      return NextResponse.json({ code: 'validation_error', message: 'Invalid email format' }, { status: 400 });
    }

    let resolvedCourseId: string | undefined = course_id;

    // If course_id not provided, resolve from j_code and course_code
    if (!resolvedCourseId && j_code && course_code) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('j_code', j_code)
        .eq('course_code', course_code)
        .single();

      if (courseError || !course) {
        return NextResponse.json({ code: 'not_found', message: 'Course not found' }, { status: 404 });
      }

      resolvedCourseId = course.id;
    }

    if (!resolvedCourseId) {
      return NextResponse.json({ code: 'validation_error', message: 'Course ID or jurisdiction/course code required' }, { status: 400 });
    }

    // Verify course exists and user is enrolled
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', resolvedCourseId)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ code: 'not_found', message: 'Course enrollment not found' }, { status: 404 });
    }

    // Generate token and hash
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    // Create guardian request
    const { data: guardianRequest, error: insertError } = await supabase
      .from('guardian_requests')
      .insert({
        student_id: user.id,
        course_id: resolvedCourseId,
        guardian_name,
        guardian_email,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating guardian request:', insertError);
      return NextResponse.json({ code: 'database_error', message: 'Failed to create request' }, { status: 500 });
    }

    // Get course and jurisdiction info for email
    const { data: courseInfo } = await supabase
      .from('courses')
      .select(`
        title,
        j_code,
        jurisdictions!inner(name)
      `)
      .eq('id', resolvedCourseId)
      .single();

    // Get user profile for display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const studentDisplay = profile ? `${profile.first_name} ${profile.last_name.charAt(0)}.` : 'Student';

    // Send email
    const verifyUrl = `${process.env.APP_BASE_URL}/guardian/${rawToken}`;
    await sendGuardianRequestEmail({
      to: guardian_email,
      guardian_name,
      student_display: studentDisplay,
      course_title: courseInfo?.title || 'Course',
      verify_url: verifyUrl,
      help_email: process.env.SUPPORT_EMAIL || 'support@permitschool.com'
    });

    return NextResponse.json({ request_id: guardianRequest.id });
  } catch (error) {
    console.error('Guardian request error:', error);
    return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
