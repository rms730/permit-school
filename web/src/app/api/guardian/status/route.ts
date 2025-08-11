import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function get(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ code: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json({ code: 'validation_error', message: 'Course ID is required' }, { status: 400 });
    }

    // Get latest guardian status for this student and course
    const { data: guardianStatus, error } = await supabase
      .from('v_guardian_latest')
      .select('*')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching guardian status:', error);
      return NextResponse.json({ code: 'database_error', message: 'Failed to fetch status' }, { status: 500 });
    }

    return NextResponse.json({ status: guardianStatus || null });
  } catch (error) {
    console.error('Guardian status error:', error);
    return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
