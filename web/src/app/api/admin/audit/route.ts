import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: { user: userData } } = await supabase.auth.getUser();
    const isAdmin = userData?.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 per page
    const offset = (page - 1) * limit;

    // Build query with filters
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    const action = searchParams.get('action');
    const objectTable = searchParams.get('object_table');
    const actorUserId = searchParams.get('actor_user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (action) {
      query = query.eq('action', action);
    }

    if (objectTable) {
      query = query.eq('object_table', objectTable);
    }

    if (actorUserId) {
      query = query.eq('actor_user_id', actorUserId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Get total count and paginated results
    const { data: auditLogs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Audit logs retrieval error:', error);
      return NextResponse.json({ error: "Failed to retrieve audit logs" }, { status: 500 });
    }

    // Verify signatures for each log entry
    const verifiedLogs = await Promise.all(
      auditLogs?.map(async (log) => {
        const { data: isValid } = await supabase.rpc('verify_audit_signature', {
          audit_log_id: log.id
        });
        
        return {
          ...log,
          signature_valid: isValid
        };
      }) || []
    );

    return NextResponse.json({
      audit_logs: verifiedLogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      },
      filters: {
        action,
        object_table: objectTable,
        actor_user_id: actorUserId,
        start_date: startDate,
        end_date: endDate
      }
    });
  } catch (error) {
    console.error("Audit GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
