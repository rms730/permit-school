import { getSupabaseAdmin } from './supabaseAdmin';

export async function uploadCertificatePdf(
  certId: string, 
  pdf: Uint8Array, 
  jCode: string
): Promise<{ path: string }> {
  const supabase = getSupabaseAdmin();
  
  const year = new Date().getFullYear();
  const fileName = `${certId}.pdf`;
  const path = `certificates/${jCode}/${year}/${fileName}`;

  const { error } = await supabase.storage
    .from('certificates')
    .upload(path, pdf, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.error('Failed to upload certificate PDF:', error);
    throw new Error(`Failed to upload certificate PDF: ${error.message}`);
  }

  return { path };
}
