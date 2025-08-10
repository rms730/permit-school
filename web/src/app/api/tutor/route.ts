import { NextResponse } from 'next/server';

function getFunctionsBase() {
  const explicit = process.env.SUPABASE_FUNCTIONS_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const raw = process.env.SUPABASE_URL!;
  const host = new URL(raw).hostname; // "<ref>.supabase.co"
  const ref = host.split('.')[0];
  return `https://${ref}.functions.supabase.co`;
}

export async function POST(req: Request) {
  try {
    const { query, j_code = 'CA', top_k = 5 } = await req.json();

    if (!query || typeof query !== 'string') {
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
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Tutor proxy failed', detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
