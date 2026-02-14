import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

import { getBearerToken, sha256Hex } from './companionTokens';

type AuthResult =
  | { ok: true; userId: string; tokenId: string; scopes: string[] }
  | { ok: false; error: string };

export async function authenticateCompanionRequest(req: Request): Promise<AuthResult> {
  const raw = getBearerToken(req);
  if (!raw) return { ok: false, error: 'Missing bearer token' };

  // Basic sanity limit to avoid pathological headers.
  if (raw.length < 20 || raw.length > 300) {
    return { ok: false, error: 'Invalid bearer token' };
  }

  const tokenHash = sha256Hex(raw);
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from('companion_tokens')
    .select('id, user_id, scopes, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) {
    return { ok: false, error: 'Token lookup failed' };
  }
  if (!data || data.revoked_at) {
    return { ok: false, error: 'Token not found or revoked' };
  }

  // Best-effort touch last_used_at (do not fail auth if it errors).
  try {
    await supabaseAdmin
      .from('companion_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);
  } catch {
    // ignore
  }

  return {
    ok: true,
    tokenId: data.id,
    userId: data.user_id,
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
  };
}

