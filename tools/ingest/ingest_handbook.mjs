import "dotenv/config";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const REQUIRED = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
];
for (const k of REQUIRED) {
  if (!process.env[k]) {
    console.error("[ingest] Missing env var:", k);
    process.exit(1);
  }
}

const argv = process.argv.slice(2);
const args = Object.fromEntries(
  argv
    .map((a, i) =>
      a.startsWith("--")
        ? [
            a.replace(/^--/, "").split("=")[0],
            a.includes("=")
              ? a.split("=").slice(1).join("=")
              : argv[i + 1] && !argv[i + 1].startsWith("--")
                ? argv[i + 1]
                : true,
          ]
        : [],
    )
    .filter(Boolean),
);

const url = args.url;
const jurisdictionCode = (args.jurisdiction || "CA").toUpperCase();
const lang = (args.lang || "en").toLowerCase();
const sourceUrl = args.source || url;

if (!url) {
  console.error(
    "Usage: node tools/ingest/ingest_handbook.mjs --url <PDF_URL> --jurisdiction CA --lang en --source <SOURCE_URL>",
  );
  process.exit(1);
}

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchPdfBuffer(pdfUrl) {
  const res = await fetch(pdfUrl, { redirect: "follow" });
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + pdfUrl);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

function chunkText(full, target = 1400, overlap = 200) {
  const clean = full
    .replace(/\r/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n");
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + target);
    let slice = clean.slice(i, end);
    const lastDot = slice.lastIndexOf(". ");
    if (lastDot > target * 0.6) slice = slice.slice(0, lastDot + 1);
    slice = slice.trim();
    if (slice.length > 100) chunks.push(slice);
    i += Math.max(1, slice.length - overlap);
  }
  return chunks;
}

async function main() {
  console.log("[ingest] downloading:", url);
  const buf = await fetchPdfBuffer(url);
  const parsed = await pdfParse(buf);
  const chunks = chunkText(parsed.text);
  console.log("[ingest] chunks:", chunks.length);

  const { data: jur, error: jurErr } = await sb
    .from("jurisdictions")
    .select("id")
    .eq("code", jurisdictionCode)
    .single();
  if (jurErr || !jur) throw jurErr || new Error("jurisdiction not found");

  const model = "text-embedding-3-small"; // 1536-dim to match DB
  const batchSize = 64;
  let inserted = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const emb = await openai.embeddings.create({ model, input: batch });
    const rows = batch.map((chunk, idx) => ({
      jurisdiction_id: jur.id,
      section_ref: `chunk_${i + idx + 1}`,
      lang,
      source_url: sourceUrl,
      chunk,
      embedding: emb.data[idx].embedding,
    }));
    const { error } = await sb.from("content_chunks").insert(rows);
    if (error) {
      console.error("[ingest] insert error:", error);
      process.exit(1);
    }
    inserted += rows.length;
    console.log(`[ingest] inserted ${inserted}/${chunks.length}`);
  }

  console.log("[ingest] done 🎉");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
