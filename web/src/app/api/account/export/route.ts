import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST() {
  try {
    const supabase = await getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a pending export
    const { data: existingExport } = await supabase
      .from('data_exports')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingExport) {
      return NextResponse.json({ 
        error: "Export already in progress",
        export_id: existingExport.id,
        created_at: existingExport.created_at
      }, { status: 409 });
    }

    // Create new export request
    const { data: exportRequest, error } = await supabase
      .from('data_exports')
      .insert({
        user_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Export creation error:', error);
      return NextResponse.json({ error: "Failed to create export request" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Export request created",
      export_id: exportRequest.id,
      status: exportRequest.status
    });
  } catch (error) {
    console.error("Export POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the latest export for the user
    const { data: exportRequest, error } = await supabase
      .from('data_exports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Export retrieval error:', error);
      return NextResponse.json({ error: "Failed to retrieve export status" }, { status: 500 });
    }

    if (!exportRequest) {
      return NextResponse.json({ 
        message: "No export requests found",
        status: null 
      });
    }

    // If export is ready, generate signed URL for download
    let downloadUrl = null;
    if (exportRequest.status === 'ready' && exportRequest.bundle_path) {
      try {
        const adminSupabase = getSupabaseAdmin();
        const { data: signedUrl } = await adminSupabase.storage
          .from('exports')
          .createSignedUrl(exportRequest.bundle_path, 3600); // 1 hour expiry
        
        downloadUrl = signedUrl?.signedUrl;
      } catch (urlError) {
        console.error('Signed URL generation error:', urlError);
        // Don't fail the request, just don't provide download URL
      }
    }

    return NextResponse.json({
      export_id: exportRequest.id,
      status: exportRequest.status,
      created_at: exportRequest.created_at,
      updated_at: exportRequest.updated_at,
      expires_at: exportRequest.expires_at,
      error: exportRequest.error,
      download_url: downloadUrl
    });
  } catch (error) {
    console.error("Export GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
