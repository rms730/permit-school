export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { buildCsv, generateQrUrl, generateBarcodeValue , CertificateData } from '@/lib/fulfillment/buildCsv';
import { buildManifest, calculateCsvHash } from '@/lib/fulfillment/buildManifest';
import { fetchPending } from '@/lib/fulfillment/fetchPending';
import { zipAndStore } from '@/lib/fulfillment/zipAndStore';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
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

    // Parse request body
    const { j_code, course_id, dryRun = false } = await request.json();

    if (!j_code || typeof j_code !== 'string') {
      return NextResponse.json({ error: 'j_code is required' }, { status: 400 });
    }

    // Check if fulfillment is enabled
    if (process.env.FULFILLMENT_ON !== 'true') {
      return NextResponse.json({ error: 'Fulfillment is not enabled' }, { status: 503 });
    }

    // Get pending certificates
    const pendingCertificates = await fetchPending(j_code, course_id);

    if (pendingCertificates.length === 0) {
      return NextResponse.json({ 
        message: 'No pending certificates found',
        count: 0 
      });
    }

    if (dryRun) {
      return NextResponse.json({
        message: 'Dry run completed',
        count: pendingCertificates.length,
        certificates: pendingCertificates.map(cert => ({
          certificate_id: cert.certificate_id,
          full_name: cert.full_name,
          course_code: cert.course_code
        }))
      });
    }

    // Create fulfillment batch
    const { data: batchData, error: batchError } = await supabase.rpc('create_fulfillment_batch', {
      p_j_code: j_code,
      p_course_id: course_id,
      p_creator: user.id
    });

    if (batchError) {
      return NextResponse.json({ 
        error: `Failed to create batch: ${batchError.message}` 
      }, { status: 500 });
    }

    const batchId = batchData;

    // Get batch details
    const { data: batch, error: batchFetchError } = await supabase
      .from('fulfillment_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchFetchError || !batch) {
      return NextResponse.json({ 
        error: 'Failed to fetch batch details' 
      }, { status: 500 });
    }

    // Get fulfillment items for this batch
    const { data: items, error: itemsError } = await supabase
      .from('fulfillment_items')
      .select('*')
      .eq('batch_id', batchId);

    if (itemsError || !items) {
      return NextResponse.json({ 
        error: 'Failed to fetch batch items' 
      }, { status: 500 });
    }

    // Build certificate data for CSV
    const certificateData: CertificateData[] = items.map(item => {
      const snapshot = item.snapshot as any;
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://permit-school.com';
      
      return {
        issue_batch_id: batchId,
        certificate_serial: item.serial,
        student_full_name: snapshot.full_name || '',
        first_name: snapshot.first_name || '',
        middle_name: snapshot.middle_name || '',
        last_name: snapshot.last_name || '',
        dob: snapshot.dob || '',
        completion_date: snapshot.completion_date || '',
        course_code: snapshot.course_code || '',
        course_title: snapshot.course_title || '',
        jurisdiction_code: j_code,
        school_name: 'Permit School', // TODO: Get from config
        school_license_number: '12345', // TODO: Get from config
        school_address_line1: '123 Main St', // TODO: Get from config
        school_address_line2: '',
        school_city: 'Los Angeles', // TODO: Get from config
        school_state: 'CA', // TODO: Get from config
        school_postal_code: '90210', // TODO: Get from config
        school_phone: '(555) 123-4567', // TODO: Get from config
        signatory_printed_name: 'John Doe', // TODO: Get from config
        signatory_title: 'Director', // TODO: Get from config
        wet_signature_required: 'Y',
        mail_to_name: snapshot.full_name || '',
        mail_to_line1: snapshot.address_line1 || '',
        mail_to_line2: snapshot.address_line2 || '',
        mail_to_city: snapshot.city || '',
        mail_to_state: snapshot.state || '',
        mail_to_postal_code: snapshot.postal_code || '',
        qr_verify_url: generateQrUrl(item.certificate_id, baseUrl),
        barcode_value: generateBarcodeValue(item.serial),
        language: 'EN' // TODO: Get from user preference
      };
    });

    // Build CSV
    const csvContent = buildCsv(certificateData);
    const csvHash = calculateCsvHash(csvContent);

    // Build manifest
    const manifestData = {
      batchId,
      jCode: j_code,
      counts: batch.counts,
      csv: {
        filename: 'certificates.csv',
        sha256: csvHash
      },
      createdAt: new Date().toISOString()
    };

    const manifest = buildManifest(manifestData, process.env.FULFILLMENT_HMAC_SECRET!);

    // Create and store ZIP
    const zipResult = await zipAndStore(batchId, {
      csvContent,
      manifest
    });

    if (!zipResult.success) {
      return NextResponse.json({ 
        error: `Failed to create ZIP: ${zipResult.error}` 
      }, { status: 500 });
    }

    // Update batch with export path and HMAC
    const { error: updateError } = await supabase
      .from('fulfillment_batches')
      .update({
        status: 'exported',
        export_path: zipResult.exportPath,
        hmac_sha256: manifest.hmac
      })
      .eq('id', batchId);

    if (updateError) {
      return NextResponse.json({ 
        error: `Failed to update batch: ${updateError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      batchId,
      count: items.length,
      exportPath: zipResult.exportPath,
      hmac: manifest.hmac
    });

  } catch (error) {
    console.error('Fulfillment run error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
