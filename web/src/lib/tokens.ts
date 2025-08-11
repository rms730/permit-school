import { createHash } from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @returns base64url-encoded token (32+ bytes)
 */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString('base64url');
}

/**
 * Hash a token using SHA-256
 * @param raw - the raw token string
 * @returns hex digest of the token
 */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
