import { NextRequest, NextResponse } from 'next/server';

import { sendCertificateVoidedEmail } from '@/lib/email';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const { certificate_id, reason } = await request.json();

    if (!certificate_id || typeof certificate_id !== 'string') {
      return NextResponse.json(
        { error: 'Missing certificate_id', code: 'BAD_BODY' },
        { status: 400 }
      );
    }

    const supabase = await getRouteClient();

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

    // Load certificate
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select('id, status, number, student_id')
      .eq('id', certificate_id)
      .single();

    if (certError || !certificate) {
      return NextResponse.json(
        { error: 'Certificate not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (certificate.status === 'void') {
      return NextResponse.json(
        { error: 'Certificate is already void', code: 'ALREADY_VOID' },
        { status: 400 }
      );
    }

    // Update certificate to void
    const { error: updateError } = await supabase
      .from('certificates')
      .update({
        status: 'void',
        voided_at: new Date().toISOString(),
        void_reason: reason || null
      })
      .eq('id', certificate_id);

    if (updateError) {
      console.error('Failed to void certificate:', updateError);
      return NextResponse.json(
        { error: 'Failed to void certificate', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Send certificate voided email
    try {
      const { data: user } = await supabase.auth.admin.getUserById(certificate.student_id);
      if (user?.user?.email) {
        await sendCertificateVoidedEmail({
          to: user.user.email,
          name: user.user.user_metadata?.full_name,
          certNumber: certificate.number || '',
          reason: reason,
        });
      }
    } catch (emailError) {
      console.error('Failed to send certificate voided email:', emailError);
    }

    return NextResponse.json({
      message: 'Certificate voided successfully',
      number: certificate.number
    });

  } catch (error) {
    console.error('Certificate void error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
