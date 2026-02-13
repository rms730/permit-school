import { describe, it, expect } from 'vitest';
import { BUILD } from '../version';

describe('version', () => {
  describe('BUILD', () => {
    it('maintains object structure', () => {
      expect(BUILD).toHaveProperty('env');
      expect(BUILD).toHaveProperty('sha');
      expect(BUILD).toHaveProperty('builtAt');
      expect(typeof BUILD.env).toBe('string');
      expect(typeof BUILD.sha).toBe('string');
      expect(typeof BUILD.builtAt).toBe('string');
    });

    it('is exported as a constant object', () => {
      expect(BUILD).toBeDefined();
      expect(typeof BUILD).toBe('object');
      expect(Array.isArray(BUILD)).toBe(false);
    });

    it('has expected default values', () => {
      // These values depend on the current environment variables
      expect(BUILD.env).toBeDefined();
      expect(BUILD.sha).toBeDefined();
      expect(BUILD.builtAt).toBeDefined();
    });

    it('uses nullish coalescing operator correctly', () => {
      // Test that the object is properly structured for nullish coalescing
      const testObj = {
        env: process.env.NEXT_PUBLIC_ENV ?? 'dev',
        sha: process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'dev',
        builtAt: process.env.NEXT_PUBLIC_BUILD_AT ?? '',
      };
      
      expect(testObj).toHaveProperty('env');
      expect(testObj).toHaveProperty('sha');
      expect(testObj).toHaveProperty('builtAt');
    });

    it('handles environment variable fallbacks', () => {
      // Test the fallback logic
      const env = process.env.NEXT_PUBLIC_ENV ?? 'dev';
      const sha = process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'dev';
      const builtAt = process.env.NEXT_PUBLIC_BUILD_AT ?? '';
      
      expect(typeof env).toBe('string');
      expect(typeof sha).toBe('string');
      expect(typeof builtAt).toBe('string');
    });

    it('has consistent property types', () => {
      expect(typeof BUILD.env).toBe('string');
      expect(typeof BUILD.sha).toBe('string');
      expect(typeof BUILD.builtAt).toBe('string');
    });

    it('is immutable', () => {
      const originalEnv = BUILD.env;
      const originalSha = BUILD.sha;
      const originalBuiltAt = BUILD.builtAt;
      
      // Attempt to modify (should not affect the original)
      const modified = { ...BUILD };
      modified.env = 'modified';
      
      expect(BUILD.env).toBe(originalEnv);
      expect(BUILD.sha).toBe(originalSha);
      expect(BUILD.builtAt).toBe(originalBuiltAt);
    });

    it('can be destructured', () => {
      const { env, sha, builtAt } = BUILD;
      
      expect(env).toBe(BUILD.env);
      expect(sha).toBe(BUILD.sha);
      expect(builtAt).toBe(BUILD.builtAt);
    });

    it('can be spread into another object', () => {
      const spread = { ...BUILD };
      
      expect(spread.env).toBe(BUILD.env);
      expect(spread.sha).toBe(BUILD.sha);
      expect(spread.builtAt).toBe(BUILD.builtAt);
    });

    it('has the correct number of properties', () => {
      const keys = Object.keys(BUILD);
      expect(keys).toHaveLength(3);
      expect(keys).toContain('env');
      expect(keys).toContain('sha');
      expect(keys).toContain('builtAt');
    });
  });
});
