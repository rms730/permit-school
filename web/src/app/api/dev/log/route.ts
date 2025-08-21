import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: true }); // no-op in prod
  }
  try {
    const body = await req.json();
    // eslint-disable-next-line no-console
    console.log('[DEV LOG]', JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[DEV LOG ERROR]', e?.message);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
