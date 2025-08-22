import { NextRequest, NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const { number } = params;

    if (!number) {
      return NextResponse.json(
        { error: 'Certificate number required', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const supabase = getRouteClient();

    // Find certificate by number
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select('id, status, pdf_path')
      .eq('number', number)
      .eq('status', 'issued')
      .single();

    if (certError || !certificate) {
      return NextResponse.json(
        { error: 'Certificate not found or not issued', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!certificate.pdf_path) {
      return NextResponse.json(
        { error: 'PDF not available', code: 'PDF_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get public URL for PDF
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(certificate.pdf_path);

    // Redirect to the public URL
    return NextResponse.redirect(publicUrl);

  } catch (error) {
    console.error('Certificate PDF error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
