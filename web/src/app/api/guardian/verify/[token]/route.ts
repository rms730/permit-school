import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { hashToken } from '@/lib/tokens';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { token } = params;

    if (!token) {
      return NextResponse.json({ code: 'validation_error', message: 'Token is required' }, { status: 400 });
    }

    // Hash the token for lookup
    const tokenHash = hashToken(token);

    // Find the guardian request
    const { data: guardianRequest, error } = await supabase
      .from('guardian_requests')
      .select(`
        *,
        courses!inner(
          title,
          j_code,
          jurisdictions!inner(
            name,
            guardian_disclaimers
          )
        ),
        profiles!inner(
          first_name,
          last_name
        )
      `)
      .eq('token_hash', tokenHash)
      .eq('status', 'pending')
      .single();

    if (error || !guardianRequest) {
      return NextResponse.json({ code: 'not_found', message: 'Invalid or expired token' }, { status: 410 });
    }

    // Check if expired
    if (new Date(guardianRequest.expires_at) < new Date()) {
      return NextResponse.json({ code: 'expired', message: 'Token has expired' }, { status: 410 });
    }

    // Return masked student info and course details
    const studentInitials = `${guardianRequest.profiles.first_name} ${guardianRequest.profiles.last_name.charAt(0)}.`;
    const jurisdiction = guardianRequest.courses.jurisdictions;
    
    return NextResponse.json({
      student_initials: studentInitials,
      course_title: guardianRequest.courses.title,
      jurisdiction_name: jurisdiction.name,
      jurisdiction_disclaimers: jurisdiction.guardian_disclaimers || [],
      guardian_name: guardianRequest.guardian_name,
      expires_at: guardianRequest.expires_at
    });
  } catch (error) {
    console.error('Guardian verify error:', error);
    return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
