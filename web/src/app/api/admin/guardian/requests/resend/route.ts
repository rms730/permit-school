import { NextRequest, NextResponse } from 'next/server';

import { sendGuardianRequestEmail } from '@/lib/email';
import { getRouteClient } from '@/lib/supabaseRoute';
import { generateToken, hashToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getRouteClient();
    
    // Check admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ code: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ code: 'forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { request_id } = body;

    if (!request_id) {
      return NextResponse.json({ code: 'validation_error', message: 'Request ID is required' }, { status: 400 });
    }

    // Get the original request
    const { data: originalRequest, error: fetchError } = await supabase
      .from('guardian_requests')
      .select(`
        *,
        courses!inner(
          title,
          j_code
        ),
        profiles!inner(
          first_name,
          last_name
        )
      `)
      .eq('id', request_id)
      .single();

    if (fetchError || !originalRequest) {
      return NextResponse.json({ code: 'not_found', message: 'Request not found' }, { status: 404 });
    }

    // Cancel the original request
    const { error: cancelError } = await supabase
      .from('guardian_requests')
      .update({ status: 'canceled' })
      .eq('id', request_id);

    if (cancelError) {
      console.error('Error canceling original request:', cancelError);
      return NextResponse.json({ code: 'database_error', message: 'Failed to cancel original request' }, { status: 500 });
    }

    // Generate new token
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    // Create new request
    const { data: newRequest, error: insertError } = await supabase
      .from('guardian_requests')
      .insert({
        student_id: originalRequest.student_id,
        course_id: originalRequest.course_id,
        guardian_name: originalRequest.guardian_name,
        guardian_email: originalRequest.guardian_email,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating new request:', insertError);
      return NextResponse.json({ code: 'database_error', message: 'Failed to create new request' }, { status: 500 });
    }

    // Send new email
    const studentDisplay = `${originalRequest.profiles.first_name} ${originalRequest.profiles.last_name.charAt(0)}.`;
    const verifyUrl = `${process.env.APP_BASE_URL}/guardian/${rawToken}`;
    
    await sendGuardianRequestEmail({
      to: originalRequest.guardian_email,
      guardian_name: originalRequest.guardian_name,
      student_display: studentDisplay,
      course_title: originalRequest.courses.title,
      verify_url: verifyUrl,
      help_email: process.env.SUPPORT_EMAIL || 'support@permitschool.com'
    });

    return NextResponse.json({ 
      new_request_id: newRequest.id,
      message: 'Request resent successfully'
    });
  } catch (error) {
    console.error('Admin resend guardian request error:', error);
    return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
