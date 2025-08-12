/* Seed DMV handbooks into private storage and upsert metadata. */
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

type ManifestItem = {
  id: string; lang: 'en'|'es'; title: string; edition?: string; revision?: string;
  filename: string; relPath: string; sourceUrl?: string; license?: string; pages?: number;
};

async function sha256(buf: Buffer) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function upsert(item: ManifestItem) {
  const abs = path.resolve(item.relPath);
  const data = await fs.readFile(abs);
  const hash = await sha256(data);
  const bytes = data.byteLength;

  const storagePath = `${item.id}/${item.filename}`;

  // upload with upsert to private bucket
  const { error: upErr } = await supabase.storage
    .from('handbooks')
    .upload(storagePath, data, { upsert: true, contentType: 'application/pdf' });
  if (upErr) throw upErr;

  const { error: dbErr } = await supabase
    .from('handbook_sources')
    .upsert({
      id: item.id,
      lang: item.lang,
      title: item.title,
      edition: item.edition ?? null,
      revision: item.revision ?? null,
      source_url: item.sourceUrl ?? null,
      license: item.license ?? null,
      storage_path: storagePath,
      filename: item.filename,
      bytes,
      sha256: hash,
      pages: item.pages ?? null
    }, { onConflict: 'id' });
  if (dbErr) throw dbErr;

  console.log(`Seeded ${item.id} (${bytes} bytes, sha256=${hash.slice(0,8)}…)`);
}

async function main() {
  const manifestPath = path.resolve('docs/sources/dmv/manifest.handbooks.json');
  const raw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw) as { items: ManifestItem[] };
  for (const item of manifest.items) {
    await upsert(item);
  }
  console.log('Handbook seeding complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
