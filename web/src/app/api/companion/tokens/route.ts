import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateCompanionToken } from '@/lib/companionTokens';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRouteClient } from '@/lib/supabaseRoute';

const CreateTokenSchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
  scopes: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});

export async function GET() {
  const supaRoute = await getRouteClient();
  const { data, error } = await supaRoute.auth.getUser();
  const userId = data?.user?.id ?? null;
  if (error || !userId) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: tokens, error: listError } = await supabaseAdmin
    .from('companion_tokens')
    .select('id, label, scopes, created_at, last_used_at, revoked_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (listError) {
    return NextResponse.json({ error: 'Failed to list tokens' }, { status: 500 });
  }

  return NextResponse.json({ tokens: tokens ?? [] });
}

export async function POST(req: Request) {
  const supaRoute = await getRouteClient();
  const { data, error } = await supaRoute.auth.getUser();
  const userId = data?.user?.id ?? null;
  if (error || !userId) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const parsed = CreateTokenSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { token, tokenHash } = generateCompanionToken();
  const scopes = parsed.data.scopes?.length ? parsed.data.scopes : ['tutor'];

  const supabaseAdmin = getSupabaseAdmin();
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('companion_tokens')
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      label: parsed.data.label ?? null,
      scopes,
    })
    .select('id, label, scopes, created_at')
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }

  // Return the raw token exactly once.
  return NextResponse.json({
    token,
    token_id: inserted.id,
    label: inserted.label,
    scopes: inserted.scopes,
    created_at: inserted.created_at,
  });
}
