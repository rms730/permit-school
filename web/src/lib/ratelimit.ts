type Entry = { n: number; resetAt: number };
const bucket = new Map<string, Entry>();

export function rateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  const e = bucket.get(key);
  
  if (!e || now >= e.resetAt) {
    bucket.set(key, { n: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }
  
  if (e.n >= max) {
    return { ok: false, remaining: 0, resetAt: e.resetAt };
  }
  
  e.n += 1;
  bucket.set(key, e);
  return { ok: true, remaining: max - e.n, resetAt: e.resetAt };
}

export function getRateLimitHeaders(result: { ok: boolean; remaining: number; resetAt: number }) {
  return {
    'X-RateLimit-Limit': process.env.RATE_LIMIT_MAX || '60',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
    ...(result.ok ? {} : {
      'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
    }),
  };
}

export function getRateLimitKey(request: Request): string {
  // Use IP address as the key
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `rate_limit:${ip}`;
}
