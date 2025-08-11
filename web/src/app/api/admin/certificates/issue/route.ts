import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';
import { renderCertificatePDF } from '@/lib/certPdf';
import { uploadCertificatePdf } from '@/lib/certStorage';
import { sendCertificateIssuedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { certificate_id } = await request.json();

    if (!certificate_id || typeof certificate_id !== 'string') {
      return NextResponse.json(
        { error: 'Missing certificate_id', code: 'BAD_BODY' },
        { status: 400 }
      );
    }

    const supabase = getRouteClient();

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: adminProfileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Load certificate with related data
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select(`
        id,
        student_id,
        course_id,
        jurisdiction_id,
        status,
        passed_at,
        profiles!certificates_student_id_fkey(full_name),
        courses(title, code),
        jurisdictions(code, name)
      `)
      .eq('id', certificate_id)
      .single();

    if (certError || !certificate) {
      return NextResponse.json(
        { error: 'Certificate not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (certificate.status !== 'draft') {
      return NextResponse.json(
        { error: 'Certificate is not in draft status', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Check profile completeness for the student
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', certificate.student_id)
      .single();

    if (studentProfileError || !studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found', code: 'PROFILE_MISSING' },
        { status: 412 }
      );
    }

    // Check required profile fields
    const requiredFields = ['first_name', 'last_name', 'dob', 'address_line1', 'city', 'state', 'postal_code'];
    const missingFields = requiredFields.filter(field => !studentProfile[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Student profile incomplete', 
          code: 'PROFILE_INCOMPLETE',
          missing_fields: missingFields
        },
        { status: 412 }
      );
    }

    // Check terms and privacy acceptance
    if (!studentProfile.terms_accepted_at || !studentProfile.privacy_accepted_at) {
      const missingConsents = [
        ...(!studentProfile.terms_accepted_at ? ['terms_accepted'] : []),
        ...(!studentProfile.privacy_accepted_at ? ['privacy_accepted'] : [])
      ];
      
      return NextResponse.json(
        { 
          error: 'Student has not accepted required agreements', 
          code: 'CONSENT_MISSING',
          missing_fields: missingConsents
        },
        { status: 412 }
      );
    }

    // Check if minor and guardian consent required
    const dob = new Date(studentProfile.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const isMinor = age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate());

    if (isMinor) {
      // Check for recent guardian consent (within last year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const { data: guardianConsent } = await supabase
        .from('consents')
        .select('signed_at')
        .eq('student_id', certificate.student_id)
        .eq('consent_type', 'guardian')
        .gte('signed_at', oneYearAgo.toISOString())
        .order('signed_at', { ascending: false })
        .limit(1)
        .single();

      if (!guardianConsent) {
        return NextResponse.json(
          { 
            error: 'Guardian consent required for minor student', 
            code: 'GUARDIAN_CONSENT_MISSING',
            is_minor: true
          },
          { status: 412 }
        );
      }
    }

    // Generate certificate number
    const { data: numberResult, error: numberError } = await supabase
      .rpc('make_certificate_number', { j_code: (certificate.jurisdictions as any).code });

    if (numberError || !numberResult) {
      console.error('Failed to generate certificate number:', numberError);
      return NextResponse.json(
        { error: 'Failed to generate certificate number', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Render PDF
    const pdfData = {
      studentName: (certificate.profiles as any)?.full_name || 'Student',
      courseTitle: (certificate.courses as any)?.title || (certificate.courses as any)?.code || 'Course',
      jurisdiction: (certificate.jurisdictions as any)?.name || (certificate.jurisdictions as any)?.code || 'Jurisdiction',
      number: numberResult,
      issuedAt: new Date(),
      issuerName: process.env.CERT_ISSUER_NAME || 'Driving Academy',
      issuerLicense: process.env.CERT_ISSUER_LICENSE || 'LICENSE-123',
      verifyUrl: `${process.env.APP_ORIGIN || 'http://localhost:3000'}/verify/${numberResult}`
    };

    const pdfBuffer = await renderCertificatePDF(pdfData);

    // Upload to storage
    const { path: pdfPath } = await uploadCertificatePdf(
      certificate.id,
      pdfBuffer,
      (certificate.jurisdictions as any).code
    );

    // Update certificate
    const { error: updateError } = await supabase
      .from('certificates')
      .update({
        status: 'issued',
        number: numberResult,
        pdf_path: pdfPath,
        issued_by: user.id,
        issued_at: new Date().toISOString()
      })
      .eq('id', certificate_id);

    if (updateError) {
      console.error('Failed to update certificate:', updateError);
      return NextResponse.json(
        { error: 'Failed to update certificate', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Get public URL for PDF
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(pdfPath);

    // Send certificate issued email
    try {
      const { data: user } = await supabase.auth.admin.getUserById(certificate.student_id);
      if (user?.user?.email) {
        await sendCertificateIssuedEmail({
          to: user.user.email,
          name: (certificate.profiles as any)?.full_name,
          certNumber: numberResult,
          verifyUrl: `${process.env.APP_ORIGIN || 'http://localhost:3000'}/verify/${numberResult}`,
          pdfUrl: publicUrl,
        });
      }
    } catch (emailError) {
      console.error('Failed to send certificate email:', emailError);
    }

    return NextResponse.json({
      number: numberResult,
      pdf_url: publicUrl
    });

  } catch (error) {
    console.error('Certificate issue error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
