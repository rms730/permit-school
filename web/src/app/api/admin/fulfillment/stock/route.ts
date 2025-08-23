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
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const jCode = searchParams.get('j_code');
    const isUsed = searchParams.get('is_used');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    // Build base query for count
    let countQuery = supabase
      .from('cert_stock')
      .select('id', { count: 'exact', head: true });

    // Apply filters to count query
    if (jCode) {
      countQuery = countQuery.eq('j_code', jCode);
    }

    if (isUsed !== null) {
      countQuery = countQuery.eq('is_used', isUsed === 'true');
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
      .from('cert_stock')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (jCode) {
      query = query.eq('j_code', jCode);
    }

    if (isUsed !== null) {
      query = query.eq('is_used', isUsed === 'true');
    }

    // Get paginated results
    const { data: stock, error: stockError } = await query
      .range(offset, offset + limit - 1);

    if (stockError) {
      return NextResponse.json({ 
        error: `Failed to fetch stock: ${stockError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      stock: stock || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Fulfillment stock error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
