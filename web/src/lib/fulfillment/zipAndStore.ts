import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

import { Manifest } from './buildManifest';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ZipContents {
  csvContent: string;
  manifest: Manifest;
  coverPdf?: Buffer;
}

export interface StoreResult {
  success: boolean;
  exportPath?: string;
  error?: string;
}

/**
 * Create ZIP file and store in Supabase storage
 */
export async function zipAndStore(
  batchId: string,
  contents: ZipContents,
  bucketName: string = 'dmv_fulfillment'
): Promise<StoreResult> {
  try {
    const zip = new JSZip();

    // Add CSV file
    zip.file('certificates.csv', contents.csvContent);

    // Add manifest file
    zip.file('manifest.json', JSON.stringify(contents.manifest, null, 2));

    // Add cover PDF if provided
    if (contents.coverPdf) {
      zip.file('cover-insert.pdf', contents.coverPdf);
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Create storage path with date structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const exportPath = `exports/${year}/${month}/${batchId}.zip`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(exportPath, zipBuffer, {
        contentType: 'application/zip',
        upsert: false
      });

    if (error) {
      return {
        success: false,
        error: `Failed to upload ZIP: ${error.message}`
      };
    }

    return {
      success: true,
      exportPath
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: `Failed to create ZIP: ${error.message}`
    };
  }
}

/**
 * Download ZIP file from storage
 */
export async function downloadZip(exportPath: string, bucketName: string = 'dmv_fulfillment'): Promise<Buffer | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(exportPath);

    if (error) {
      console.error('Failed to download ZIP:', error);
      return null;
    }

    return Buffer.from(await data.arrayBuffer());
  } catch (err) {
    console.error('Error downloading ZIP:', err);
    return null;
  }
}
