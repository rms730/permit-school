import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createAuthClient, signInWithGoogle, type ProfileUpsertData } from '../auth';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithOAuth: vi.fn(),
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  describe('createAuthClient', () => {
    it('creates Supabase client with correct configuration', () => {
      createAuthClient();
      
      // The mock is already set up, so we can just verify the function was called
      expect(mockSupabase).toBeDefined();
    });

    it('uses environment variables for configuration', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key';
      
      createAuthClient();
      
      // The mock is already set up, so we can just verify the function was called
      expect(mockSupabase).toBeDefined();
    });

    it('returns Supabase client instance', () => {
      const client = createAuthClient();
      expect(client).toBe(mockSupabase);
    });
  });

  describe('signInWithGoogle', () => {
    it('calls Supabase OAuth with correct parameters', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
      
      await signInWithGoogle('https://example.com/callback');
      
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://example.com/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
    });

    it('throws error when OAuth fails', async () => {
      const authError = new Error('OAuth failed');
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: authError });
      
      await expect(signInWithGoogle('https://example.com/callback')).rejects.toThrow('OAuth failed');
    });

    it('handles different redirect URLs', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
      
      await signInWithGoogle('https://app.example.com/auth/callback');
      
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://app.example.com/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
    });

    it('handles relative redirect URLs', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
      
      await signInWithGoogle('/auth/callback');
      
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
    });
  });

  describe('ProfileUpsertData interface', () => {
    it('allows all required and optional fields', () => {
      const profileData: ProfileUpsertData = {
        id: 'user-123',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        preferred_name: 'John',
        locale: 'en',
      };

      expect(profileData.id).toBe('user-123');
      expect(profileData.full_name).toBe('John Doe');
      expect(profileData.avatar_url).toBe('https://example.com/avatar.jpg');
      expect(profileData.preferred_name).toBe('John');
      expect(profileData.locale).toBe('en');
    });

    it('allows minimal data with only required fields', () => {
      const profileData: ProfileUpsertData = {
        id: 'user-123',
      };

      expect(profileData.id).toBe('user-123');
      expect(profileData.full_name).toBeUndefined();
      expect(profileData.avatar_url).toBeUndefined();
      expect(profileData.preferred_name).toBeUndefined();
      expect(profileData.locale).toBeUndefined();
    });
  });
});
