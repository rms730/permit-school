import { z } from 'zod';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

import { createChatCompletion, createEmbedding } from './openai';

const TutorOptsSchema = z.object({
  query: z.string().trim().min(1).max(1200),
  jCode: z.string().trim().min(2).max(8).default('CA'),
  topK: z.number().int().min(1).max(50).default(5),
  lang: z.enum(['en', 'es']).default('en'),
  unitId: z.string().uuid().optional(),
});

export type TutorCitation = {
  idx: number;
  id: number;
  section_ref: string | null;
  source_url: string | null;
  distance: number | null;
  rank: number | null;
  score: number | null;
};

export type TutorSource = {
  idx: number;
  title: string;
  excerpt: string;
  source_url: string | null;
};

export type TutorResult = {
  answer: string;
  citations: TutorCitation[];
  sources: TutorSource[];
  model: string;
  latency_ms: number;
  retrieved_k: number;
};

type Hit = {
  id: number;
  section_ref: string | null;
  source_url: string | null;
  chunk: string;
  distance?: number | null;
  rank?: number | null;
  score?: number | null;
};

function compactWhitespace(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

export async function runTutor(raw: z.input<typeof TutorOptsSchema>): Promise<TutorResult> {
  const started = Date.now();
  const opts = TutorOptsSchema.parse(raw);

  if (process.env.OFFLINE_DEV === '1') {
    return {
      answer:
        'Offline mode is enabled, so this is a stubbed tutor answer. Turn off OFFLINE_DEV to use real retrieval and AI.',
      citations: [],
      sources: [],
      model: 'offline-stub',
      latency_ms: Date.now() - started,
      retrieved_k: 0,
    };
  }

  const embedModel = process.env.AI_EMBED_MODEL ?? 'text-embedding-3-small';
  const tutorModel = process.env.AI_TUTOR_MODEL ?? 'gpt-4o-mini';
  const maxExcerptChars = Math.max(
    200,
    Math.min(2000, Number.parseInt(process.env.AI_MAX_EXCERPT_CHARS || '800', 10) || 800),
  );

  // 1) Embed the question.
  const embedding = await createEmbedding(opts.query, embedModel);

  // 2) Retrieve from our handbook corpus.
  const supabaseAdmin = getSupabaseAdmin();
  const matchCount = Math.min(Math.max(opts.topK, 1), 8);

  const { data: hits, error } = await supabaseAdmin.rpc('match_content_chunks_hybrid', {
    j_code: opts.jCode,
    query: opts.query,
    q_embedding: embedding,
    match_count: matchCount,
    lang: opts.lang,
    unit_id: opts.unitId ?? null,
  });

  if (error) {
    throw new Error(`Tutor retrieval failed: ${error.message ?? String(error)}`);
  }

  const safeHits = (Array.isArray(hits) ? hits : []) as Hit[];

  // If retrieval yields nothing, do not call the model (avoid hallucinations).
  if (safeHits.length === 0) {
    return {
      answer:
        "I couldn't find anything in the handbook corpus to answer that confidently. Try rephrasing your question (include the road situation, sign/signal, and who has the right-of-way), or jump to the relevant handbook section and ask again.",
      citations: [],
      sources: [],
      model: tutorModel,
      latency_ms: Date.now() - started,
      retrieved_k: 0,
    };
  }

  // 3) Build a grounded prompt with excerpts.
  const excerpts = safeHits
    .map((h, i) => {
      const excerpt = compactWhitespace(String(h.chunk || '')).slice(0, maxExcerptChars);
      const source = h.source_url ? `Source: ${h.source_url}` : 'Source: N/A';
      return `[${i + 1}] ${excerpt}\n${source}`;
    })
    .join('\n\n');

  const systemMsg = [
    `You are Permit School's strict DMV tutor for ${opts.jCode}.`,
    'Answer ONLY from the provided excerpts.',
    "If the excerpts don't cover the question, say you are not certain and suggest which topic/section to study.",
    'Keep answers to 4–7 sentences.',
    'Add inline citations like [1], [2] that refer to the excerpt numbers.',
    "Do not invent citations, laws, or DMV policy that isn't in the excerpts.",
    'End with exactly one short tip the student should remember.',
  ].join(' ');

  const userMsg = `Question: ${opts.query}

Excerpts:
${excerpts}`;

  // 4) Ask OpenAI for a concise, cited answer.
  const chat = await createChatCompletion({
    model: tutorModel,
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: userMsg },
    ],
  });

  const citations: TutorCitation[] = safeHits.map((h, i) => ({
    idx: i + 1,
    id: h.id,
    section_ref: h.section_ref ?? null,
    source_url: h.source_url ?? null,
    distance: typeof h.distance === 'number' ? h.distance : null,
    rank: typeof h.rank === 'number' ? h.rank : null,
    score: typeof h.score === 'number' ? h.score : null,
  }));

  const sources: TutorSource[] = safeHits.map((h, i) => ({
    idx: i + 1,
    title: h.section_ref ?? `Excerpt ${i + 1}`,
    excerpt: compactWhitespace(String(h.chunk || '')).slice(0, Math.min(240, maxExcerptChars)),
    source_url: h.source_url ?? null,
  }));

  return {
    answer: chat.content || '',
    citations,
    sources,
    model: chat.model,
    latency_ms: Date.now() - started,
    retrieved_k: safeHits.length,
  };
}

