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
