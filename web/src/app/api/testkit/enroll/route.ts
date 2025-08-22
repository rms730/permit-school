import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

interface EnrollOptions {
  user_id: string;
  jurisdiction_code: string;
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
    const body: EnrollOptions = await request.json();
    const { user_id, jurisdiction_code, course_code } = body;
    
    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_enroll',
      timestamp: new Date().toISOString(),
      user_id,
      jurisdiction_code,
      course_code,
      user_agent: request.headers.get('user-agent')
    }));

    // Get jurisdiction ID first
    const { data: jurisdictionData, error: jurisdictionError } = await supabase
      .from('jurisdictions')
      .select('id')
      .eq('code', jurisdiction_code)
      .single();

    if (jurisdictionError || !jurisdictionData) {
      console.error('Jurisdiction lookup error:', jurisdictionError);
      return NextResponse.json({ 
        error: 'Jurisdiction not found',
        details: jurisdictionError 
      }, { status: 404 });
    }

    // Get course ID
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('jurisdiction_id', jurisdictionData.id)
      .eq('code', course_code)
      .single();

    if (courseError || !courseData) {
      console.error('Course lookup error:', courseError);
      return NextResponse.json({ 
        error: 'Course not found',
        details: courseError 
      }, { status: 404 });
    }

    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('course_id', courseData.id)
      .single();

    if (existingEnrollment) {
      // Update existing enrollment to active
      const { data: updatedEnrollment, error: updateError } = await supabase
        .from('enrollments')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEnrollment.id)
        .select()
        .single();

      if (updateError) {
        console.error('Enrollment update error:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update enrollment',
          details: updateError 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        enrollment: updatedEnrollment,
        message: 'Enrollment updated to active',
        timestamp: new Date().toISOString()
      });
    }

    // Create new enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id,
        course_id: courseData.id,
        status: 'active',
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error('Enrollment creation error:', enrollmentError);
      return NextResponse.json({ 
        error: 'Failed to create enrollment',
        details: enrollmentError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      enrollment,
      message: 'Enrollment created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit enrollment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during enrollment' 
    }, { status: 500 });
  }
}
