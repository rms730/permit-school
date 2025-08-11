import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ code: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ code: 'forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('guardian_requests')
      .select(`
        *,
        courses!inner(
          title,
          j_code
        ),
        profiles!inner(
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: requests, error, count } = await query;

    if (error) {
      console.error('Error fetching guardian requests:', error);
      return NextResponse.json({ code: 'database_error', message: 'Failed to fetch requests' }, { status: 500 });
    }

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Admin guardian requests error:', error);
    return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
