import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const { attemptId } = params;
    const supabase = getRouteClient();

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }

    // Get attempt and verify it's for a permit course
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .select(`
        id,
        student_id,
        course_id,
        mode,
        score,
        completed_at,
        courses!inner(
          id,
          code,
          title,
          jurisdiction_id,
          programs!inner(
            id,
            code,
            kind
          ),
          jurisdictions!inner(
            id,
            code,
            name,
            certificate_type
          )
        )
      `)
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: "Attempt not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (attempt.student_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 403 },
      );
    }

    // Verify this is a permit course
    if (attempt.courses.programs.kind !== 'permit') {
      return NextResponse.json(
        { error: "Certificates are only available for permit courses", code: "INVALID_COURSE_TYPE" },
        { status: 400 },
      );
    }

    // Verify attempt is completed
    if (!attempt.completed_at) {
      return NextResponse.json(
        { error: "Attempt must be completed before generating certificate", code: "ATTEMPT_NOT_COMPLETED" },
        { status: 400 },
      );
    }

    // Check if certificate outcome already exists
    const { data: existingOutcome } = await supabase
      .from("outcomes")
      .select("id")
      .eq("attempt_id", attemptId)
      .eq("kind", "certificate")
      .single();

    if (existingOutcome) {
      return NextResponse.json(
        { error: "Certificate already generated for this attempt", code: "CERTIFICATE_EXISTS" },
        { status: 409 },
      );
    }

    // Check if attempt passed (assuming 70% is passing for permits)
    const passingScore = 0.7; // 70%
    if (!attempt.score || attempt.score < passingScore) {
      return NextResponse.json(
        { error: "Attempt score does not meet passing requirements", code: "INSUFFICIENT_SCORE" },
        { status: 400 },
      );
    }

    // Get user profile for certificate data
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Generate certificate number (format: JURISDICTION-YEAR-SEQUENTIAL)
    const year = new Date().getFullYear();
    const adminSupabase = getSupabaseAdmin();
    
    // Get next certificate number for this jurisdiction and year
    const { data: lastCert } = await adminSupabase
      .from("certificates")
      .select("dl_serial")
      .eq("jurisdiction_id", attempt.courses.jurisdiction_id)
      .like("dl_serial", `${attempt.courses.jurisdictions.code}-${year}-%`)
      .order("dl_serial", { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastCert?.dl_serial) {
      const parts = lastCert.dl_serial.split('-');
      const lastSequence = parseInt(parts[2] || '0');
      sequence = lastSequence + 1;
    }

    const certificateNumber = `${attempt.courses.jurisdictions.code}-${year}-${sequence.toString().padStart(4, '0')}`;

    // Create certificate record
    const { data: certificate, error: certError } = await adminSupabase
      .from("certificates")
      .insert({
        student_id: user.id,
        course_id: attempt.course_id,
        jurisdiction_id: attempt.courses.jurisdiction_id,
        dl_serial: certificateNumber,
        status: 'ready',
        ship_to: {
          name: profile?.full_name || 'Student',
          address1: 'Online Course',
          city: 'Online',
          state: attempt.courses.jurisdictions.code,
          zip: '00000'
        },
        passed_at: attempt.completed_at,
      })
      .select("id, dl_serial")
      .single();

    if (certError || !certificate) {
      console.error("Certificate creation error:", certError);
      return NextResponse.json(
        { error: "Failed to create certificate", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Create certificate outcome
    const certificatePayload = {
      certificateId: certificate.id,
      certificateNumber: certificate.dl_serial,
      jurisdictionCode: attempt.courses.jurisdictions.code,
      jurisdictionName: attempt.courses.jurisdictions.name,
      courseCode: attempt.courses.code,
      courseTitle: attempt.courses.title,
      studentName: profile?.full_name || 'Student',
      passedAt: attempt.completed_at,
      score: attempt.score,
      certificateType: attempt.courses.jurisdictions.certificate_type,
    };

    const { error: outcomeError } = await adminSupabase
      .from("outcomes")
      .insert({
        kind: 'certificate',
        user_id: user.id,
        attempt_id: attemptId,
        course_id: attempt.course_id,
        payload: certificatePayload,
      });

    if (outcomeError) {
      console.error("Error creating certificate outcome:", outcomeError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      certificateId: certificate.id,
      certificateNumber: certificate.dl_serial,
      status: 'ready',
      message: 'Certificate generated successfully',
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
