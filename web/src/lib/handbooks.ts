import { getServerClient } from '@/lib/supabaseServer';

export async function getHandbookSignedUrl(id: string, expiresIn = 3600) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from('handbook_sources')
    .select('storage_path, filename')
    .eq('id', id)
    .single();
  if (error) throw error;

  const { data: signed, error: sErr } = await supabase.storage
    .from('handbooks')
    .createSignedUrl(data.storage_path, expiresIn);
  if (sErr) throw sErr;

  return { url: signed.signedUrl, filename: data.filename };
}
