import { NextRequest, NextResponse } from 'next/server';

import { downloadZip } from '@/lib/regulatory/downloadZip';
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
      .select('id, status')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    if (run.status !== 'succeeded') {
      return NextResponse.json({ error: "Run is not ready for download" }, { status: 400 });
    }

    // Generate ZIP
    const { zip, filename } = await downloadZip({ runId });

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Return ZIP file
    return new NextResponse(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error("Regulatory download error:", error);
    return NextResponse.json({ 
      error: "Failed to download regulatory report",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
