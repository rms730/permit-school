import { describe, it, expect, vi } from 'vitest';
import { generateToken, hashToken } from '../tokens';

// Mock crypto
const mockCrypto = {
  getRandomValues: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
});

describe('tokens utilities', () => {
  describe('generateToken', () => {
    it('generates a cryptographically secure random token', () => {
      const token = generateToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });

    it('generates different tokens on each call', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      
      expect(token1).not.toBe(token2);
    });

    it('generates base64url-encoded tokens', () => {
      const token = generateToken();
      
      // Base64url should only contain alphanumeric characters, -, and _
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('hashToken', () => {
    it('hashes a token using SHA-256', () => {
      const rawToken = 'test-token-123';
      const hashedToken = hashToken(rawToken);
      
      expect(hashedToken).toBeDefined();
      expect(typeof hashedToken).toBe('string');
      expect(hashedToken.length).toBe(64); // SHA-256 hex digest length
    });

    it('produces consistent hashes for the same input', () => {
      const rawToken = 'test-token-123';
      const hash1 = hashToken(rawToken);
      const hash2 = hashToken(rawToken);
      
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different inputs', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('handles empty string input', () => {
      const hash = hashToken('');
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it('handles special characters in input', () => {
      const rawToken = 'test-token-with-special-chars!@#$%^&*()';
      const hash = hashToken(rawToken);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });
});
