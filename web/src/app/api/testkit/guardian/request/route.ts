import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

interface GuardianRequestOptions {
  user_id: string;
  j_code: string;
  course_code: string;
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
    const body: GuardianRequestOptions = await request.json();
    const { user_id, j_code, course_code } = body;
    
    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_guardian_request',
      timestamp: new Date().toISOString(),
      user_id,
      j_code,
      course_code,
      user_agent: request.headers.get('user-agent')
    }));

    // Get course ID
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

    // Generate token (same logic as production)
    const token = crypto.randomBytes(32).toString('base64url');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Create guardian request
    const { data: guardianRequest, error: requestError } = await supabase
      .from('guardian_requests')
      .insert({
        user_id,
        course_id: courseData.id,
        guardian_email: 'guardian@permit-school.test',
        token_hash: hashedToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (requestError) {
      console.error('Guardian request creation error:', requestError);
      return NextResponse.json({ 
        error: 'Failed to create guardian request',
        details: requestError 
      }, { status: 500 });
    }

    // Build the signing URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const signingUrl = `${baseUrl}/guardian/${token}`;

    return NextResponse.json({
      success: true,
      guardian_request: guardianRequest,
      token, // Only returned in testkit for testing
      signing_url: signingUrl,
      message: 'Guardian request created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit guardian request error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during guardian request creation' 
    }, { status: 500 });
  }
}
