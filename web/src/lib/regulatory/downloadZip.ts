import JSZip from 'jszip';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export interface DownloadZipParams {
  runId: string;
}

export async function downloadZip(params: DownloadZipParams): Promise<{ zip: JSZip; filename: string }> {
  const { runId } = params;
  const supabase = getSupabaseAdmin();

  // Get run details
  const { data: run, error: runError } = await supabase
    .from('regulatory_runs')
    .select(`
      *,
      courses!inner(code, title),
      jurisdictions!inner(code)
    `)
    .eq('id', runId)
    .single();

  if (runError) {
    throw new Error(`Failed to get run: ${runError.message}`);
  }

  // Get artifacts
  const { data: artifacts, error: artifactsError } = await supabase
    .from('regulatory_artifacts')
    .select('*')
    .eq('run_id', runId)
    .order('name');

  if (artifactsError) {
    throw new Error(`Failed to get artifacts: ${artifactsError.message}`);
  }

  if (!artifacts || artifacts.length === 0) {
    throw new Error('No artifacts found for this run');
  }

  // Create ZIP
  const zip = new JSZip();

  // Download and add each artifact
  for (const artifact of artifacts) {
    try {
      const { data, error } = await supabase.storage
        .from('dmv_reports')
        .download(artifact.storage_path);

      if (error) {
        console.error(`Failed to download ${artifact.name}:`, error);
        continue;
      }

      if (data) {
        zip.file(artifact.name, data);
      }
    } catch (error) {
      console.error(`Error downloading ${artifact.name}:`, error);
      // Continue with other files
    }
  }

  // Generate filename
  const filename = `regulatory-report-${run.jurisdictions.code}-${run.courses.code}-${run.period_start}-${run.period_end}.zip`;

  return { zip, filename };
}
