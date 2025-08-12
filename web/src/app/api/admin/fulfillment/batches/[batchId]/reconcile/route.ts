import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { processReconciliation } from '@/lib/fulfillment/reconcile';

export async function POST(
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

    // Verify batch exists and is exported
    const { data: batch, error: batchError } = await supabaseAuth
      .from('fulfillment_batches')
      .select('status')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.status !== 'exported') {
      return NextResponse.json({ error: 'Batch not exported yet' }, { status: 400 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const mailedFile = formData.get('mailed.csv') as File | null;
    const exceptionsFile = formData.get('exceptions.csv') as File | null;

    if (!mailedFile && !exceptionsFile) {
      return NextResponse.json({ 
        error: 'At least one reconciliation file is required' 
      }, { status: 400 });
    }

    let mailedCsv: string | undefined;
    let exceptionsCsv: string | undefined;

    // Read mailed.csv if provided
    if (mailedFile) {
      if (mailedFile.type !== 'text/csv' && !mailedFile.name.endsWith('.csv')) {
        return NextResponse.json({ 
          error: 'mailed.csv must be a CSV file' 
        }, { status: 400 });
      }

      mailedCsv = await mailedFile.text();
    }

    // Read exceptions.csv if provided
    if (exceptionsFile) {
      if (exceptionsFile.type !== 'text/csv' && !exceptionsFile.name.endsWith('.csv')) {
        return NextResponse.json({ 
          error: 'exceptions.csv must be a CSV file' 
        }, { status: 400 });
      }

      exceptionsCsv = await exceptionsFile.text();
    }

    // Process reconciliation
    const result = await processReconciliation(batchId, mailedCsv, exceptionsCsv);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Reconciliation failed',
        details: result.errors
      }, { status: 400 });
    }

    // Update batch status to reconciled if successful
    if (result.success && (result.mailedCount > 0 || result.exceptionCount > 0)) {
      const { error: updateError } = await supabaseAuth
        .from('fulfillment_batches')
        .update({ status: 'reconciled' })
        .eq('id', batchId);

      if (updateError) {
        console.error('Failed to update batch status:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      mailedCount: result.mailedCount,
      exceptionCount: result.exceptionCount,
      errors: result.errors
    });

  } catch (error) {
    console.error('Fulfillment reconcile error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
