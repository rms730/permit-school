import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const jCode = searchParams.get('jCode');
    const courseId = searchParams.get('courseId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 per page
    const cursor = searchParams.get('cursor'); // UUID for pagination

    // Build query
    let query = supabase
      .from('regulatory_runs')
      .select(`
        *,
        courses!inner(code, title),
        regulatory_artifacts(count)
      `, { count: 'exact' });

    // Apply filters
    if (jCode) {
      query = query.eq('j_code', jCode);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    // Apply cursor pagination
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    // Get results ordered by most recent first
    const { data: runs, error, count } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Regulatory runs retrieval error:', error);
      return NextResponse.json({ error: "Failed to retrieve regulatory runs" }, { status: 500 });
    }

    // Transform data to include artifact count
    const transformedRuns = runs?.map(run => ({
      ...run,
      artifact_count: run.regulatory_artifacts?.[0]?.count || 0,
      regulatory_artifacts: undefined // Remove the nested data
    })) || [];

    // Get next cursor for pagination
    const nextCursor = transformedRuns.length > 0 && transformedRuns.length === limit
      ? transformedRuns[transformedRuns.length - 1].created_at
      : null;

    return NextResponse.json({
      runs: transformedRuns,
      pagination: {
        limit,
        total: count || 0,
        next_cursor: nextCursor,
        has_more: !!nextCursor
      },
      filters: {
        jCode,
        courseId
      }
    });

  } catch (error) {
    console.error("Regulatory runs GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
