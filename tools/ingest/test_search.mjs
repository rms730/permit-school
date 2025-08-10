import 'dotenv/config';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const query = process.argv.slice(2).join(' ') || 'right-of-way at four-way stop in California';
if (!process.env.SUPABASE_URL || !process.env.OPENAI_API_KEY) {
  console.error('Set SUPABASE_URL and OPENAI_API_KEY (and optionally SUPABASE_SERVICE_ROLE_KEY if you want server role).');
  process.exit(1);
}
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', { auth: { persistSession:false } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const emb = await openai.embeddings.create({ model: 'text-embedding-3-small', input: query });
  const vec = emb.data[0].embedding;

  const { data, error } = await sb.rpc('match_content_chunks', {
    j_code: 'CA',
    q_embedding: vec,
    match_count: 5
  });
  if (error) { console.error('RPC error:', error); process.exit(1); }

  console.log('\nQuery:', query);
  for (const r of data) {
    console.log(`- id=${r.id} dist=${r.distance.toFixed(4)} src=${r.source_url || ''}`);
    console.log(`  ${r.chunk.slice(0, 160).replace(/\s+/g,' ')}...\n`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
