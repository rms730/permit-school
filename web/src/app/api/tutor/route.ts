import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRouteClient } from '@/lib/supabaseRoute';

function getFunctionsBase() {
  const explicit = process.env.SUPABASE_FUNCTIONS_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const raw = process.env.SUPABASE_URL!;
  const host = new URL(raw).hostname; // "<ref>.supabase.co"
  const ref = host.split('.')[0];
  return `https://${ref}.functions.supabase.co`;
}

export async function POST(req: Request) {
  const started = Date.now();
  let j_code = 'CA';
  let query = '';
  let top_k = 5;

  // read user from cookies/session (if present)
  const supaRoute = getRouteClient();
  const { data: userData } = await supaRoute.auth.getUser();
  const userId = userData?.user?.id ?? null;

  try {
    const body = await req.json();
    query = typeof body?.query === 'string' ? body.query : '';
    j_code = typeof body?.j_code === 'string' ? body.j_code : 'CA';
    top_k = Number.isFinite(body?.top_k) ? Math.max(1, Math.min(50, body.top_k)) : 5;

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    const url = `${getFunctionsBase()}/tutor`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query, j_code, top_k })
    });

    const data = await res.json();
    const latency = Date.now() - started;

    // Best-effort log (non-blocking failure)
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.from('tutor_logs').insert([
        {
          user_id: userId,
          j_code,
          query,
          top_k,
          latency_ms: latency,
          model: data?.model ?? 'unknown',
          error: res.ok ? null : (data?.error ?? `HTTP ${res.status}`)
        }
      ]);
    } catch {
      // swallow logging errors
    }

    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err: any) {
    const latency = Date.now() - started;
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.from('tutor_logs').insert([
        {
          user_id: userId,
          j_code,
          query,
          top_k,
          latency_ms: latency,
          model: 'unknown',
          error: String(err?.message ?? err)
        }
      ]);
    } catch {}

    return NextResponse.json(
      { error: 'Tutor proxy failed', detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
