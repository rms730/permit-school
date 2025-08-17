import { NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    // Check if user is guardian or admin
    if (profile.role !== 'guardian' && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get linked children
    const { data: children, error: childrenError } = await supabase
      .from('v_guardian_children')
      .select('*')
      .eq('guardian_id', user.id);

    if (childrenError) {
      console.error('Error fetching guardian children:', childrenError);
      return NextResponse.json(
        { error: 'Failed to fetch children', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ children: children || [] });

  } catch (error) {
    console.error('Guardian children API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
