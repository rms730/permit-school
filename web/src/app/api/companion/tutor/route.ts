import { NextResponse } from 'next/server';

import { runTutor } from '@/lib/ai/tutor';
import { authenticateCompanionRequest } from '@/lib/companionAuth';
import { getLocaleFromRequest } from '@/lib/i18n/server';
import { rateLimit, getRateLimitHeaders, getRateLimitKey } from '@/lib/ratelimit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const started = Date.now();

  const auth = await authenticateCompanionRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
  }
  if (auth.scopes.length > 0 && !auth.scopes.includes('tutor')) {
    return NextResponse.json({ error: 'Forbidden', code: 'INSUFFICIENT_SCOPE' }, { status: 403 });
  }

  // Rate limiting (token-scoped)
  const rateLimitEnabled = process.env.RATE_LIMIT_ON === 'true';
  let rateHeaders: Record<string, string> | undefined;
  if (rateLimitEnabled) {
    const ipKey = getRateLimitKey(req);
    const key = `${ipKey}:companion:${auth.tokenId}`;
    const windowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
    const max = Number.parseInt(process.env.RATE_LIMIT_MAX || '60', 10);

    const result = rateLimit(key, windowMs, max);
    rateHeaders = getRateLimitHeaders(result);

    if (!result.ok) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: rateHeaders });
    }
  }

  let j_code = 'CA';
  let query = '';
  let top_k = 5;
  let lang: 'en' | 'es' = 'en';
  let unit_id: string | undefined;

  try {
    const body = await req.json().catch(() => ({}));
    query = typeof body?.query === 'string' ? body.query : '';
    j_code = typeof body?.j_code === 'string' ? body.j_code : 'CA';
    top_k = Number.isFinite(body?.top_k) ? Math.max(1, Math.min(50, body.top_k)) : 5;
    unit_id = typeof body?.unit_id === 'string' ? body.unit_id : undefined;
    lang =
      typeof body?.lang === 'string'
        ? (body.lang.toLowerCase().startsWith('es') ? 'es' : 'en')
        : (await getLocaleFromRequest()).toLowerCase().startsWith('es')
          ? 'es'
          : 'en';

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400, headers: rateHeaders });
    }

    const data = await runTutor({
      query,
      jCode: j_code,
      topK: top_k,
      lang,
      unitId: unit_id,
    });

    // Best-effort log (non-blocking failure)
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.from('ai_tutor_logs').insert([
        {
          user_id: auth.userId,
          auth_kind: 'companion_token',
          j_code,
          query,
          top_k,
          lang,
          latency_ms: Date.now() - started,
          model: data?.model ?? 'unknown',
          answer: data?.answer ?? null,
          citations: data?.citations ?? [],
          unit_id: unit_id ?? null,
          error: null,
        },
      ]);
    } catch {
      // ignore
    }

    return NextResponse.json(data, { status: 200, headers: rateHeaders });
  } catch (err: any) {
    // Best-effort log error
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.from('ai_tutor_logs').insert([
        {
          user_id: auth.userId,
          auth_kind: 'companion_token',
          j_code,
          query,
          top_k,
          lang,
          latency_ms: Date.now() - started,
          model: 'unknown',
          unit_id: unit_id ?? null,
          error: String(err?.message ?? err),
        },
      ]);
    } catch {
      // ignore
    }

    return NextResponse.json(
      { error: 'Tutor failed', detail: String(err?.message ?? err) },
      { status: 500, headers: rateHeaders },
    );
  }
}
