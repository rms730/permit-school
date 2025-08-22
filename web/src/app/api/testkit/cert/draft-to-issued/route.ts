import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

interface CertificateOptions {
  certificate_id?: string;
  user_id?: string;
  j_code?: string;
  course_code?: string;
}

export async function POST(request: NextRequest) {
  // Environment guard - return 404 if testkit is not enabled
  if (process.env.TESTKIT_ON !== 'true') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Token validation
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.TESTKIT_TOKEN;
  
  if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body: CertificateOptions = await request.json();
    const { certificate_id, user_id, j_code, course_code } = body;
    
    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_cert_draft_to_issued',
      timestamp: new Date().toISOString(),
      certificate_id,
      user_id,
      j_code,
      course_code,
      user_agent: request.headers.get('user-agent')
    }));

    let certificateId = certificate_id;

    // If no certificate_id provided, find draft certificate by user and course
    if (!certificateId && user_id && j_code && course_code) {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('j_code', j_code)
        .eq('course_code', course_code)
        .single();

      if (courseError || !courseData) {
        console.error('Course lookup error:', courseError);
        return NextResponse.json({ 
          error: 'Course not found',
          details: courseError 
        }, { status: 404 });
      }

      const { data: draftCert, error: certError } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user_id)
        .eq('course_id', courseData.id)
        .eq('status', 'draft')
        .single();

      if (certError || !draftCert) {
        console.error('Draft certificate lookup error:', certError);
        return NextResponse.json({ 
          error: 'Draft certificate not found',
          details: certError 
        }, { status: 404 });
      }

      certificateId = draftCert.id;
    }

    if (!certificateId) {
      return NextResponse.json({ 
        error: 'Certificate ID or user/course combination required' 
      }, { status: 400 });
    }

    // Call the existing admin issue endpoint
    const issueResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/certificates/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${expectedToken}` // Use testkit token for admin access
      },
      body: JSON.stringify({ certificate_id: certificateId })
    });

    if (!issueResponse.ok) {
      const errorData = await issueResponse.json();
      console.error('Certificate issue error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to issue certificate',
        details: errorData 
      }, { status: issueResponse.status });
    }

    const issueData = await issueResponse.json();

    // Get the issued certificate details
    const { data: issuedCert, error: fetchError } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (fetchError) {
      console.error('Certificate fetch error:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch issued certificate',
        details: fetchError 
      }, { status: 500 });
    }

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify/${issuedCert.number}`;

    return NextResponse.json({
      success: true,
      certificate: issuedCert,
      certificate_number: issuedCert.number,
      verification_url: verificationUrl,
      pdf_url: issueData.pdf_url || null,
      message: 'Certificate issued successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit certificate issue error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during certificate issuance' 
    }, { status: 500 });
  }
}
