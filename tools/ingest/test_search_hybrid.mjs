import "dotenv/config";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const query = process.argv.slice(2).join(" ") || "right turn on red rules";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !process.env.OPENAI_API_KEY) {
  console.error(
    "Set SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY) + OPENAI_API_KEY",
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  // Embed the *question text*
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const vec = emb.data[0].embedding;

  // Hybrid RPC
  const { data, error } = await sb.rpc("match_content_chunks_hybrid", {
    j_code: "CA",
    query,
    q_embedding: vec,
    match_count: 5,
  });
  if (error) {
    console.error("RPC error:", error);
    process.exit(1);
  }

  console.log("\nQuery:", query);
  for (const r of data) {
    console.log(
      `- id=${r.id} dist=${r.distance.toFixed(4)} rank=${r.rank.toFixed(4)} src=${r.source_url || ""}`,
    );
    console.log(`  ${r.chunk.slice(0, 160).replace(/\s+/g, " ")}...\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
