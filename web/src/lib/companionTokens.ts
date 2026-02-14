import { createHash, randomBytes } from 'node:crypto';

export function generateCompanionToken() {
  // 32 bytes -> 256-bit token. base64url keeps it copy/paste friendly.
  const token = randomBytes(32).toString('base64url');
  const tokenHash = sha256Hex(token);
  return { token, tokenHash };
}

export function sha256Hex(input: string) {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export function getBearerToken(req: Request) {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

