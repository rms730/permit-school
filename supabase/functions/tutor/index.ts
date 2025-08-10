import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import OpenAI from "npm:openai@4.56.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing required env: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY",
  );
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY ?? "" });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader =
      req.headers.get("Authorization") ?? `Bearer ${SUPABASE_ANON_KEY}`;
    const {
      query,
      j_code = "CA",
      top_k = 5,
    } = await req.json().catch(() => ({}));

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'query' string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    // 1) Embed the question
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const vec = emb.data[0].embedding;

    // 2) Retrieve top K with our hybrid RPC (FTS + cosine; with vector fallback)
    const matchCount = Math.min(Math.max(Number(top_k) || 5, 1), 8);
    const { data: hits, error } = await sb.rpc("match_content_chunks_hybrid", {
      j_code,
      query,
      q_embedding: vec,
      match_count: matchCount,
    });
    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Build a grounded prompt with short excerpts
    const excerpts =
      (hits ?? [])
        .map(
          (h: any, i: number) =>
            `[${i + 1}] ${String(h.chunk || "")
              .replace(/\s+/g, " ")
              .slice(0, 800)}\nSource: ${h.source_url || "N/A"}`,
        )
        .join("\n\n") || "(no excerpts)";

    const systemMsg =
      "You are a strict DMV tutor. Answer ONLY from the provided excerpts. If not covered, say you're not certain and suggest studying that section. Keep answers to 4–7 sentences, and add inline citations like [1], [2].";
    const userMsg = `Question: ${query}

Excerpts:
${excerpts}

Instructions:
- Base your answer strictly on the excerpts.
- Include inline bracket citations [1], [2], etc.
- End with one short tip the student should remember.`;

    // 4) Ask OpenAI for a concise, cited answer
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
    });

    const answer = chat.choices?.[0]?.message?.content ?? "";

    // 5) Return JSON with answer + citations
    const citations = (hits ?? []).map((h: any, i: number) => ({
      idx: i + 1,
      id: h.id,
      section_ref: h.section_ref,
      source_url: h.source_url,
      distance: h.distance,
      rank: h.rank,
    }));

    return new Response(JSON.stringify({ answer, citations }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Unexpected error", detail: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
