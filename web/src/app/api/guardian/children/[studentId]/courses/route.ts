import { NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const supabase = getRouteClient();

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is admin or guardian linked to this student
    if (profile.role === 'admin') {
      // Admin can access any student
    } else if (profile.role === 'guardian') {
      // Guardian must be linked to this student
      const { data: guardianLink, error: linkError } = await supabase
        .from('guardian_links')
        .select('guardian_id')
        .eq('guardian_id', user.id)
        .eq('student_id', studentId)
        .single();

      if (linkError || !guardianLink) {
        return NextResponse.json(
          { error: 'Access denied', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Access denied', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get course progress for this student
    const { data: courses, error: coursesError } = await supabase
      .from('v_guardian_student_course')
      .select('*')
      .eq('guardian_id', user.id)
      .eq('student_id', studentId);

    if (coursesError) {
      console.error('Error fetching student courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ courses: courses || [] });

  } catch (error) {
    console.error('Guardian student courses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
