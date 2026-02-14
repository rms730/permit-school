import { z } from 'zod';

const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

function getApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return key;
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${OPENAI_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message =
      typeof json?.error?.message === 'string'
        ? json.error.message
        : text
          ? text.slice(0, 200)
          : `HTTP ${res.status}`;
    const err = new Error(`OpenAI error: ${message}`);
    (err as any).status = res.status;
    (err as any).payload = json;
    throw err;
  }

  return json;
}

const EmbeddingsResponseSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()) })).min(1),
});

export async function createEmbedding(input: string, model = 'text-embedding-3-small') {
  const json = await postJson('/embeddings', { model, input });
  const parsed = EmbeddingsResponseSchema.parse(json);
  return parsed.data[0].embedding;
}

const ChatCompletionsResponseSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().nullable().optional() }).optional(),
      })
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional(),
    })
    .optional(),
});

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function createChatCompletion(opts: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const json = await postJson('/chat/completions', {
    model: opts.model ?? process.env.AI_TUTOR_MODEL ?? 'gpt-4o-mini',
    temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.2,
    max_tokens: typeof opts.maxTokens === 'number' ? opts.maxTokens : undefined,
    messages: opts.messages,
  });

  const parsed = ChatCompletionsResponseSchema.parse(json);
  const content = parsed.choices?.[0]?.message?.content ?? '';

  return {
    content,
    model: parsed.model ?? (opts.model ?? 'unknown'),
    usage: parsed.usage,
  };
}
