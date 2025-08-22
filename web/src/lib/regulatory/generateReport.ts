import { createHash } from 'crypto';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import { getSchema } from './reportSchemas';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';


export interface GenerateReportParams {
  jCode: string;
  courseId: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  initiatedByUserId: string;
}

export interface ReportSummary {
  roster: number;
  exams: number;
  certs: number;
  seatTime: number;
}

export interface ReportArtifact {
  name: string;
  sha256: string;
  bytes: number;
}

export interface GenerateReportResult {
  runId: string;
  summary: ReportSummary;
  artifacts: ReportArtifact[];
}

// HMAC signing helper (reuse pattern from Sprint 17)
function signManifest(manifest: any, secret: string): string {
  const payload = JSON.stringify(manifest, Object.keys(manifest).sort());
  const hmac = createHash('sha256').update(payload + secret).digest('hex');
  return hmac;
}

// Generate CSV from data and schema
function generateCSV(data: any[], schema: any[]): string {
  const headers = schema.map(col => col.header).join(',');
  const rows = data.map(row => 
    schema.map(col => {
      const value = row[col.key];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

// Generate cover sheet PDF
async function generateCoverSheet(
  jCode: string,
  courseCode: string,
  courseTitle: string,
  periodStart: string,
  periodEnd: string,
  summary: ReportSummary
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Title
  page.drawText('REGULATORY REPORT COVER SHEET', {
    x: width / 2 - 150,
    y: height - 100,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Report details
  const startY = height - 200;
  const lineHeight = 25;

  page.drawText(`Jurisdiction: ${jCode}`, {
    x: 100,
    y: startY,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Course: ${courseCode} - ${courseTitle}`, {
    x: 100,
    y: startY - lineHeight,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Period: ${periodStart} to ${periodEnd}`, {
    x: 100,
    y: startY - lineHeight * 2,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Generated: ${new Date().toISOString()}`, {
    x: 100,
    y: startY - lineHeight * 3,
    size: 14,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Summary counts
  page.drawText('Summary Counts:', {
    x: 100,
    y: startY - lineHeight * 5,
    size: 16,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Students: ${summary.roster}`, {
    x: 120,
    y: startY - lineHeight * 6,
    size: 12,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Exam Attempts: ${summary.exams}`, {
    x: 120,
    y: startY - lineHeight * 7,
    size: 12,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Certificates: ${summary.certs}`, {
    x: 120,
    y: startY - lineHeight * 8,
    size: 12,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Seat Time Records: ${summary.seatTime}`, {
    x: 120,
    y: startY - lineHeight * 9,
    size: 12,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  return await pdfDoc.save();
}

// Upload file to storage and return metadata
async function uploadToStorage(
  bucket: string,
  path: string,
  data: Uint8Array | string,
  contentType: string
): Promise<{ sha256: string; bytes: number }> {
  const supabase = getSupabaseAdmin();
  
  // Convert string to Uint8Array if needed
  const bytes = typeof data === 'string' 
    ? new TextEncoder().encode(data)
    : data;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload ${path}: ${error.message}`);
  }

  // Calculate SHA256
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  
  return {
    sha256,
    bytes: bytes.length
  };
}

export async function generateReport(params: GenerateReportParams): Promise<GenerateReportResult> {
  const { jCode, courseId, periodStart, periodEnd, initiatedByUserId } = params;
  const supabase = getSupabaseAdmin();

  // 1. Create regulatory run record
  const { data: run, error: runError } = await supabase
    .from('regulatory_runs')
    .insert({
      j_code: jCode,
      course_id: courseId,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'running',
      started_at: new Date().toISOString(),
      created_by: initiatedByUserId
    })
    .select()
    .single();

  if (runError) {
    throw new Error(`Failed to create regulatory run: ${runError.message}`);
  }

  const runId = run.id;

  try {
    // 2. Get course metadata
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('code, title')
      .eq('id', courseId)
      .single();

    if (courseError) {
      throw new Error(`Failed to get course: ${courseError.message}`);
    }

    // 3. Query datasets with period filters
    const periodFilter = `and e.started_at >= '${periodStart}' and e.started_at <= '${periodEnd}'`;
    
    // Roster data
    const { data: rosterData, error: rosterError } = await supabase
      .from('v_reg_roster')
      .select('*')
      .eq('j_code', jCode)
      .eq('course_id', courseId)
      .gte('first_enroll_at', periodStart)
      .lte('first_enroll_at', periodEnd);

    if (rosterError) {
      throw new Error(`Failed to get roster data: ${rosterError.message}`);
    }

    // Exams data
    const { data: examsData, error: examsError } = await supabase
      .from('v_reg_exams')
      .select('*')
      .eq('j_code', jCode)
      .eq('course_id', courseId)
      .gte('completed_at', periodStart)
      .lte('completed_at', periodEnd);

    if (examsError) {
      throw new Error(`Failed to get exams data: ${examsError.message}`);
    }

    // Certificates data
    const { data: certsData, error: certsError } = await supabase
      .from('v_reg_certs')
      .select('*')
      .eq('j_code', jCode)
      .eq('course_id', courseId)
      .gte('issued_at', periodStart)
      .lte('issued_at', periodEnd);

    if (certsError) {
      throw new Error(`Failed to get certificates data: ${certsError.message}`);
    }

    // Seat time data
    const { data: seatTimeData, error: seatTimeError } = await supabase
      .from('v_reg_seat_time_rollup')
      .select('*')
      .eq('j_code', jCode)
      .eq('course_id', courseId);

    if (seatTimeError) {
      throw new Error(`Failed to get seat time data: ${seatTimeError.message}`);
    }

    // 4. Generate summary
    const summary: ReportSummary = {
      roster: rosterData?.length || 0,
      exams: examsData?.length || 0,
      certs: certsData?.length || 0,
      seatTime: seatTimeData?.length || 0
    };

    // 5. Generate CSV files
    const rosterCSV = generateCSV(rosterData || [], getSchema('roster'));
    const examsCSV = generateCSV(examsData || [], getSchema('exams'));
    const certsCSV = generateCSV(certsData || [], getSchema('certs'));
    const seatTimeCSV = generateCSV(seatTimeData || [], getSchema('seat_time'));

    // 6. Generate cover sheet PDF
    const coverPDF = await generateCoverSheet(
      jCode,
      course.code,
      course.title,
      periodStart,
      periodEnd,
      summary
    );

    // 7. Upload all artifacts to storage
    const storagePath = `/${jCode}/${periodStart.substring(0, 7)}/${runId}`;
    const artifacts: ReportArtifact[] = [];

    // Upload CSV files
    const rosterMeta = await uploadToStorage('dmv_reports', `${storagePath}/roster.csv`, rosterCSV, 'text/csv');
    artifacts.push({ name: 'roster.csv', ...rosterMeta });

    const examsMeta = await uploadToStorage('dmv_reports', `${storagePath}/exams.csv`, examsCSV, 'text/csv');
    artifacts.push({ name: 'exams.csv', ...examsMeta });

    const certsMeta = await uploadToStorage('dmv_reports', `${storagePath}/certs.csv`, certsCSV, 'text/csv');
    artifacts.push({ name: 'certs.csv', ...certsMeta });

    const seatTimeMeta = await uploadToStorage('dmv_reports', `${storagePath}/seat_time.csv`, seatTimeCSV, 'text/csv');
    artifacts.push({ name: 'seat_time.csv', ...seatTimeMeta });

    // Upload cover PDF
    const coverMeta = await uploadToStorage('dmv_reports', `${storagePath}/cover.pdf`, coverPDF, 'application/pdf');
    artifacts.push({ name: 'cover.pdf', ...coverMeta });

    // 8. Generate and sign manifest
    const manifest = {
      run_id: runId,
      j_code: jCode,
      course_id: courseId,
      period_start: periodStart,
      period_end: periodEnd,
      generated_at: new Date().toISOString(),
      summary,
      artifacts
    };

    const manifestJson = JSON.stringify(manifest, null, 2);
    const manifestSignature = signManifest(manifest, process.env.REGULATORY_SIGNING_SECRET || '');
    
    const signedManifest = {
      ...manifest,
      signature: manifestSignature
    };

    const signedManifestJson = JSON.stringify(signedManifest, null, 2);
    const manifestMeta = await uploadToStorage('dmv_reports', `${storagePath}/manifest.json`, signedManifestJson, 'application/json');
    artifacts.push({ name: 'manifest.json', ...manifestMeta });

    // 9. Insert artifact records
    const { error: artifactsError } = await supabase
      .from('regulatory_artifacts')
      .insert(artifacts.map(artifact => ({
        run_id: runId,
        name: artifact.name,
        storage_path: `${storagePath}/${artifact.name}`,
        sha256: artifact.sha256,
        bytes: artifact.bytes
      })));

    if (artifactsError) {
      throw new Error(`Failed to insert artifacts: ${artifactsError.message}`);
    }

    // 10. Update run status to succeeded
    const { error: updateError } = await supabase
      .from('regulatory_runs')
      .update({
        status: 'succeeded',
        finished_at: new Date().toISOString(),
        summary
      })
      .eq('id', runId);

    if (updateError) {
      throw new Error(`Failed to update run status: ${updateError.message}`);
    }

    return {
      runId,
      summary,
      artifacts
    };

  } catch (error) {
    // Update run status to failed
    await supabase
      .from('regulatory_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString()
      })
      .eq('id', runId);

    throw error;
  }
}
