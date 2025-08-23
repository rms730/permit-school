import { NextRequest, NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const supabase = await getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }



    if (!runId) {
      return NextResponse.json({ error: "Run ID is required" }, { status: 400 });
    }

    // Verify run exists and belongs to admin
    const { data: run, error: runError } = await supabase
      .from('regulatory_runs')
      .select('id')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // Get artifacts for this run
    const { data: artifacts, error: artifactsError } = await supabase
      .from('regulatory_artifacts')
      .select('*')
      .eq('run_id', runId)
      .order('name');

    if (artifactsError) {
      console.error('Error fetching artifacts:', artifactsError);
      return NextResponse.json({ error: "Failed to fetch artifacts" }, { status: 500 });
    }

    return NextResponse.json({
      artifacts: artifacts || []
    });

  } catch (error) {
    console.error("Regulatory artifacts error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch artifacts",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
