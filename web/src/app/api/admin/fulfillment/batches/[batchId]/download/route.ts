import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { downloadZip } from '@/lib/fulfillment/zipAndStore';

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
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

    const { batchId } = params;

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Get batch details to find export path
    const { data: batch, error: batchError } = await supabaseAuth
      .from('fulfillment_batches')
      .select('export_path, status')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.status !== 'exported') {
      return NextResponse.json({ error: 'Batch not exported yet' }, { status: 400 });
    }

    if (!batch.export_path) {
      return NextResponse.json({ error: 'No export file found' }, { status: 404 });
    }

    // Download ZIP file
    const zipBuffer = await downloadZip(batch.export_path);

    if (!zipBuffer) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Return ZIP file as response
    return new NextResponse(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="fulfillment-batch-${batchId}.zip"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Fulfillment download error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
