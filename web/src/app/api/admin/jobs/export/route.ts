import { createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import archiver from 'archiver';
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRouteClient } from '@/lib/supabaseRoute';



export async function POST(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    // Verify admin access (this endpoint should be called by background workers)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const expectedToken = process.env.BACKGROUND_WORKER_TOKEN;
    
    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: "Invalid worker token" }, { status: 403 });
    }

    // Get pending exports (limit to 10 to avoid timeouts)
    const { data: pendingExports, error: fetchError } = await supabase
      .from('data_exports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Failed to fetch pending exports:', fetchError);
      return NextResponse.json({ error: "Failed to fetch pending exports" }, { status: 500 });
    }

    if (!pendingExports || pendingExports.length === 0) {
      return NextResponse.json({ message: "No pending exports to process" });
    }

    const adminSupabase = getSupabaseAdmin();
    const results = [];

    for (const exportRequest of pendingExports) {
      try {
        // Update status to processing
        await supabase
          .from('data_exports')
          .update({ status: 'processing' })
          .eq('id', exportRequest.id);

        // Gather user data
        const userData = await gatherUserData(adminSupabase, exportRequest.user_id);
        
        // Create ZIP file
        const zipBuffer = await createExportZip(userData);
        
        // Upload to storage
        const fileName = `export_${exportRequest.user_id}_${Date.now()}.zip`;
        const { error: uploadError } = await adminSupabase.storage
          .from('exports')
          .upload(fileName, zipBuffer, {
            contentType: 'application/zip',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Update export record
        await supabase
          .from('data_exports')
          .update({
            status: 'ready',
            bundle_path: fileName,
            updated_at: new Date().toISOString()
          })
          .eq('id', exportRequest.id);

        results.push({
          export_id: exportRequest.id,
          status: 'success',
          file_name: fileName
        });

      } catch (error) {
        console.error(`Export processing failed for ${exportRequest.id}:`, error);
        
        // Update export record with error
        await supabase
          .from('data_exports')
          .update({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', exportRequest.id);

        results.push({
          export_id: exportRequest.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} exports`,
      results
    });

  } catch (error) {
    console.error("Export worker error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function gatherUserData(supabase: any, userId: string) {
  // Get user profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (
        id,
        code,
        name,
        jurisdictions (code, name)
      )
    `)
    .eq('user_id', userId);

  // Get seat time summary
  const { data: seatTime } = await supabase
    .from('seat_time')
    .select('*')
    .eq('user_id', userId);

  // Get attempts metadata (no sensitive data)
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, unit_id, score, completed_at, status')
    .eq('user_id', userId);

  // Get certificates metadata
  const { data: certificates } = await supabase
    .from('certificates')
    .select('id, certificate_number, status, issued_at, course_id')
    .eq('user_id', userId);

  // Generate signed URLs for certificate PDFs (if they exist)
  const certificateUrls = [];
  if (certificates) {
    for (const cert of certificates) {
      try {
        const { data: signedUrl } = await supabase.storage
          .from('certificates')
          .createSignedUrl(`${cert.certificate_number}.pdf`, 3600);
        
        if (signedUrl) {
          certificateUrls.push({
            certificate_number: cert.certificate_number,
            download_url: signedUrl.signedUrl,
            expires_at: new Date(Date.now() + 3600000).toISOString()
          });
        }
      } catch (error) {
        console.warn(`Failed to generate signed URL for certificate ${cert.certificate_number}:`, error);
      }
    }
  }

  return {
    profile,
    enrollments,
    seat_time: seatTime,
    attempts,
    certificates,
    certificate_downloads: certificateUrls,
    export_generated_at: new Date().toISOString()
  };
}

async function createExportZip(userData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // Add user data as JSON
    archive.append(JSON.stringify(userData, null, 2), { name: 'user_data.json' });

    // Add README
    const readme = `Data Export for User

This export contains your personal data from the permit school platform.

Files included:
- user_data.json: Your profile, enrollments, seat time, attempts, and certificates metadata
- certificate_downloads: Signed URLs to download your certificate PDFs (valid for 1 hour)

Generated: ${userData.export_generated_at}

Note: Certificate PDFs are available via the signed URLs in the JSON file.
These URLs expire after 1 hour for security reasons.`;

    archive.append(readme, { name: 'README.txt' });

    archive.finalize();
  });
}
