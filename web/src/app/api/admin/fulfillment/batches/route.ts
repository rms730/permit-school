export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build base query for count
    let countQuery = supabase
      .from('fulfillment_batches')
      .select('id', { count: 'exact', head: true });

    // Apply filters to count query
    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (from) {
      countQuery = countQuery.gte('created_at', from);
    }

    if (to) {
      countQuery = countQuery.lte('created_at', to);
    }

    // Get total count
    const { count, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ 
        error: `Failed to get count: ${countError.message}` 
      }, { status: 500 });
    }

    // Build query for data
    let query = supabase
      .from('fulfillment_batches')
      .select(`
        *,
        created_by_user:profiles!fulfillment_batches_created_by_fkey(full_name),
        course:courses(title, code)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (from) {
      query = query.gte('created_at', from);
    }

    if (to) {
      query = query.lte('created_at', to);
    }

    // Get paginated results
    const { data: batches, error: batchesError } = await query
      .range(offset, offset + limit - 1);

    if (batchesError) {
      return NextResponse.json({ 
        error: `Failed to fetch batches: ${batchesError.message}` 
      }, { status: 500 });
    }

    // Transform data for response
    const transformedBatches = batches?.map(batch => ({
      id: batch.id,
      j_code: batch.j_code,
      course_id: batch.course_id,
      course_title: batch.course?.title,
      course_code: batch.course?.code,
      status: batch.status,
      counts: batch.counts,
      export_path: batch.export_path,
      hmac_sha256: batch.hmac_sha256,
      created_by: batch.created_by,
      created_by_name: batch.created_by_user?.full_name,
      created_at: batch.created_at,
      updated_at: batch.updated_at
    })) || [];

    return NextResponse.json({
      batches: transformedBatches,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Fulfillment batches error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
