import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { rateLimit, getRateLimitHeaders, getRateLimitKey } from '../ratelimit';

describe('rateLimit', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('rateLimit function', () => {
    it('allows first request within window', () => {
      const result = rateLimit('test-key-1', 60000, 5);
      
      expect(result.ok).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('allows multiple requests within limit', () => {
      const key = 'test-key-2';
      const windowMs = 60000;
      const max = 3;

      // First request
      const result1 = rateLimit(key, windowMs, max);
      expect(result1.ok).toBe(true);
      expect(result1.remaining).toBe(2);

      // Second request
      const result2 = rateLimit(key, windowMs, max);
      expect(result2.ok).toBe(true);
      expect(result2.remaining).toBe(1);

      // Third request
      const result3 = rateLimit(key, windowMs, max);
      expect(result3.ok).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('blocks requests when limit is exceeded', () => {
      const key = 'test-key-3';
      const windowMs = 60000;
      const max = 2;

      // First request
      const result1 = rateLimit(key, windowMs, max);
      expect(result1.ok).toBe(true);
      expect(result1.remaining).toBe(1);

      // Second request
      const result2 = rateLimit(key, windowMs, max);
      expect(result2.ok).toBe(true);
      expect(result2.remaining).toBe(0);

      // Third request (should be blocked)
      const result3 = rateLimit(key, windowMs, max);
      expect(result3.ok).toBe(false);
      expect(result3.remaining).toBe(0);
    });

    it('resets after window expires', () => {
      const key = 'test-key-4';
      const windowMs = 100; // 100ms window
      const max = 2;

      // First request
      const result1 = rateLimit(key, windowMs, max);
      expect(result1.ok).toBe(true);
      expect(result1.remaining).toBe(1);

      // Second request (should be blocked)
      const result2 = rateLimit(key, windowMs, max);
      expect(result2.ok).toBe(true);
      expect(result2.remaining).toBe(0);

      // Wait for window to expire
      vi.advanceTimersByTime(150);

      // Request after window expires (should be allowed)
      const result3 = rateLimit(key, windowMs, max);
      expect(result3.ok).toBe(true);
      expect(result3.remaining).toBe(1);
    });

    it('handles different keys independently', () => {
      const windowMs = 60000;
      const max = 2;

      // Request for key1
      const result1 = rateLimit('key1', windowMs, max);
      expect(result1.ok).toBe(true);
      expect(result1.remaining).toBe(1);

      // Request for key2 (should be independent)
      const result2 = rateLimit('key2', windowMs, max);
      expect(result2.ok).toBe(true);
      expect(result2.remaining).toBe(1);

      // Second request for key1
      const result3 = rateLimit('key1', windowMs, max);
      expect(result3.ok).toBe(true);
      expect(result3.remaining).toBe(0);

      // Third request for key1 (should be blocked)
      const result4 = rateLimit('key1', windowMs, max);
      expect(result4.ok).toBe(false);
      expect(result4.remaining).toBe(0);

      // Second request for key2 (should still be allowed)
      const result5 = rateLimit('key2', windowMs, max);
      expect(result5.ok).toBe(true);
      expect(result5.remaining).toBe(0);
    });

    it('handles edge case with max = 1', () => {
      const key = 'test-key-5';
      const windowMs = 60000;
      const max = 1;

      // First request
      const result1 = rateLimit(key, windowMs, max);
      expect(result1.ok).toBe(true);
      expect(result1.remaining).toBe(0);

      // Second request (should be blocked)
      const result2 = rateLimit(key, windowMs, max);
      expect(result2.ok).toBe(false);
      expect(result2.remaining).toBe(0);
    });

    it('handles edge case with max = 0', () => {
      const key = 'test-key-6';
      const windowMs = 60000;
      const max = 0;

      // First request with max = 0 (should be allowed, but remaining = -1)
      const result = rateLimit(key, windowMs, max);
      expect(result.ok).toBe(true);
      expect(result.remaining).toBe(-1);
    });

    it('handles edge case with max = 0 after first request', () => {
      const key = 'test-key-6b';
      const windowMs = 60000;
      const max = 0;

      // First request with max = 0 (should be allowed)
      const result1 = rateLimit(key, windowMs, max);
      expect(result1.ok).toBe(true);
      expect(result1.remaining).toBe(-1);

      // Second request with max = 0 (should be blocked)
      const result2 = rateLimit(key, windowMs, max);
      expect(result2.ok).toBe(false);
      expect(result2.remaining).toBe(0);
    });
  });

  describe('getRateLimitHeaders function', () => {
    it('returns correct headers for successful request', () => {
      const result = { ok: true, remaining: 5, resetAt: Date.now() + 60000 };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('60'); // default from env
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('returns correct headers for rate limited request', () => {
      const result = { ok: false, remaining: 0, resetAt: Date.now() + 30000 };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('60');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(headers['Retry-After']).toBeDefined();
      expect(parseInt(headers['Retry-After']!)).toBeGreaterThan(0);
    });

    it('handles custom rate limit max from environment', () => {
      const originalEnv = process.env.RATE_LIMIT_MAX;
      process.env.RATE_LIMIT_MAX = '100';

      const result = { ok: true, remaining: 10, resetAt: Date.now() + 60000 };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('100');

      // Restore original env
      process.env.RATE_LIMIT_MAX = originalEnv;
    });

    it('calculates reset time correctly', () => {
      const now = Date.now();
      const resetAt = now + 60000;
      const result = { ok: true, remaining: 5, resetAt };
      const headers = getRateLimitHeaders(result);

      const expectedReset = Math.ceil(resetAt / 1000);
      expect(parseInt(headers['X-RateLimit-Reset']!)).toBe(expectedReset);
    });
  });

  describe('getRateLimitKey function', () => {
    it('uses x-forwarded-for header when available', () => {
      const request = new Request('http://localhost/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const key = getRateLimitKey(request);
      expect(key).toBe('rate_limit:192.168.1.1');
    });

    it('uses x-real-ip header when x-forwarded-for is not available', () => {
      const request = new Request('http://localhost/test', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });

      const key = getRateLimitKey(request);
      expect(key).toBe('rate_limit:192.168.1.2');
    });

    it('falls back to unknown when no IP headers are available', () => {
      const request = new Request('http://localhost/test');

      const key = getRateLimitKey(request);
      expect(key).toBe('rate_limit:unknown');
    });

    it('handles empty x-forwarded-for header', () => {
      const request = new Request('http://localhost/test', {
        headers: {
          'x-forwarded-for': '',
          'x-real-ip': '192.168.1.3',
        },
      });

      const key = getRateLimitKey(request);
      expect(key).toBe('rate_limit:192.168.1.3');
    });

    it('handles malformed x-forwarded-for header', () => {
      const request = new Request('http://localhost/test', {
        headers: {
          'x-forwarded-for': 'invalid-ip, 192.168.1.4',
          'x-real-ip': '192.168.1.5',
        },
      });

      const key = getRateLimitKey(request);
      expect(key).toBe('rate_limit:invalid-ip');
    });
  });

  describe('integration scenarios', () => {
    it('handles rapid requests correctly', () => {
      const key = 'rapid-test-7';
      const windowMs = 1000; // 1 second
      const max = 3;

      // Make 3 rapid requests
      const results = [];
      for (let i = 0; i < 4; i++) {
        results.push(rateLimit(key, windowMs, max));
      }

      expect(results[0].ok).toBe(true);
      expect(results[0].remaining).toBe(2);
      expect(results[1].ok).toBe(true);
      expect(results[1].remaining).toBe(1);
      expect(results[2].ok).toBe(true);
      expect(results[2].remaining).toBe(0);
      expect(results[3].ok).toBe(false);
      expect(results[3].remaining).toBe(0);
    });

    it('handles concurrent requests from different sources', () => {
      const windowMs = 60000;
      const max = 2;

      const keys = ['user1', 'user2', 'user3'];
      const results = keys.map(key => rateLimit(key, windowMs, max));

      // All should be allowed initially
      results.forEach(result => {
        expect(result.ok).toBe(true);
        expect(result.remaining).toBe(1);
      });

      // Make second requests
      const secondResults = keys.map(key => rateLimit(key, windowMs, max));
      secondResults.forEach(result => {
        expect(result.ok).toBe(true);
        expect(result.remaining).toBe(0);
      });

      // Make third requests (should be blocked)
      const thirdResults = keys.map(key => rateLimit(key, windowMs, max));
      thirdResults.forEach(result => {
        expect(result.ok).toBe(false);
        expect(result.remaining).toBe(0);
      });
    });
  });
});
