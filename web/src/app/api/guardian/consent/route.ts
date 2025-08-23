import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { renderGuardianConsentPDF } from '@/lib/consentPdf';
import { sendGuardianReceiptEmail } from '@/lib/email';
import { notifyStudentAndGuardians } from '@/lib/notify';
import { createSignedUrl } from '@/lib/storageSignedUrl';
import { hashToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { token, typed_name, relation, agree } = body;

    if (!token || !typed_name || !relation || agree !== true) {
      return NextResponse.json({ code: 'validation_error', message: 'All fields are required and consent must be given' }, { status: 400 });
    }

    // Hash the token for lookup
    const tokenHash = hashToken(token);

    // Find the guardian request
    const { data: guardianRequest, error: fetchError } = await supabase
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
          last_name,
          email
        )
      `)
      .eq('token_hash', tokenHash)
      .eq('status', 'pending')
      .single();

    if (fetchError || !guardianRequest) {
      return NextResponse.json({ code: 'not_found', message: 'Invalid or expired token' }, { status: 410 });
    }

    // Check if expired
    if (new Date(guardianRequest.expires_at) < new Date()) {
      return NextResponse.json({ code: 'expired', message: 'Token has expired' }, { status: 410 });
    }

    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create consent record
    const { data: consent, error: consentError } = await supabase
      .from('consents')
      .insert({
        student_id: guardianRequest.student_id,
        consent_type: 'guardian',
        ip_address: ip,
        user_agent: userAgent,
        payload: {
          guardian_name: guardianRequest.guardian_name,
          guardian_email: guardianRequest.guardian_email,
          typed_name,
          relation,
          course_id: guardianRequest.course_id,
          course_title: guardianRequest.courses.title,
          jurisdiction: guardianRequest.courses.jurisdictions.name
        }
      })
      .select()
      .single();

    if (consentError) {
      console.error('Error creating consent record:', consentError);
      return NextResponse.json({ code: 'database_error', message: 'Failed to record consent' }, { status: 500 });
    }

    // Generate PDF
    const pdfData = {
      studentInitials: `${guardianRequest.profiles.first_name} ${guardianRequest.profiles.last_name.charAt(0)}.`,
      guardianName: typed_name,
      courseTitle: guardianRequest.courses.title,
      jurisdiction: guardianRequest.courses.jurisdictions.name,
      relation,
      signedAt: new Date(),
      ipAddress: ip,
      userAgent,
      verifyUrl: `${process.env.APP_BASE_URL}/verify/${consent.id}`,
      jurisdictionDisclaimers: guardianRequest.courses.jurisdictions.guardian_disclaimers || []
    };

    const pdfBytes = await renderGuardianConsentPDF(pdfData);

    // Upload PDF to storage
    const year = new Date().getFullYear();
    const pdfPath = `${year}/${guardianRequest.student_id}/${guardianRequest.id}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('consents')
      .upload(pdfPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return NextResponse.json({ code: 'storage_error', message: 'Failed to save consent PDF' }, { status: 500 });
    }

    // Update guardian request
    const { error: updateError } = await supabase
      .from('guardian_requests')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_ip: ip,
        verified_user_agent: userAgent,
        consent_id: consent.id
      })
      .eq('id', guardianRequest.id);

    if (updateError) {
      console.error('Error updating guardian request:', updateError);
      return NextResponse.json({ code: 'database_error', message: 'Failed to update request status' }, { status: 500 });
    }

    // Generate signed URLs for emails
    const pdfUrl = await createSignedUrl('consents', pdfPath, 24 * 3600); // 24 hours

    // Send receipt emails
    const studentDisplay = `${guardianRequest.profiles.first_name} ${guardianRequest.profiles.last_name.charAt(0)}.`;
    const verifyUrl = `${process.env.APP_BASE_URL}/verify/${consent.id}`;

    // Send to guardian
    if (pdfUrl) {
      await sendGuardianReceiptEmail({
        to: guardianRequest.guardian_email,
        guardian_name: typed_name,
        student_display: studentDisplay,
        course_title: guardianRequest.courses.title,
        pdf_url: pdfUrl,
        verify_url: verifyUrl
      });
    }

    // Send to student
    if (pdfUrl) {
      await sendGuardianReceiptEmail({
        to: guardianRequest.profiles.email,
        guardian_name: typed_name,
        student_display: studentDisplay,
        course_title: guardianRequest.courses.title,
        pdf_url: pdfUrl,
        verify_url: verifyUrl
      });
    }

    // Send notifications (best effort, don't block response)
    try {
      await notifyStudentAndGuardians(guardianRequest.student_id, 'guardian_consent_verified', {
        course_id: guardianRequest.course_id,
        guardian_name: typed_name
      });
    } catch (notificationError) {
      console.error('Guardian consent notification error:', notificationError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Guardian consent error:', error);
    return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
