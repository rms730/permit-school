import { describe, it, expect, vi, beforeEach } from 'vitest';

import { callRoute } from '@/test/routeTestUtils';

import { GET, PUT, PATCH } from '../route';

// Mock Supabase route client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
};

vi.mock('@/lib/supabaseRoute', () => ({
  getRouteClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('returns profile for authenticated user', async () => {
      const mockUser = { id: 'user-123' };
      const mockProfile = {
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { status, json } = await callRoute(GET);

      expect(status).toBe(200);
      expect(json).toEqual(mockProfile);
    });

    it('returns empty object when no profile exists', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // No rows returned
            }),
          }),
        }),
      });

      const { status, json } = await callRoute(GET);

      expect(status).toBe(200);
      expect(json).toEqual({});
    });

    it('returns 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { status, json } = await callRoute(GET);

      expect(status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 401 for auth error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error'),
      });

      const { status, json } = await callRoute(GET);

      expect(status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 500 for database error', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'OTHER_ERROR', message: 'Database error' },
            }),
          }),
        }),
      });

      const { status, json } = await callRoute(GET);

      expect(status).toBe(500);
      expect(json).toEqual({ error: 'Database error' });
    });
  });

  describe('PUT /api/profile', () => {
    const validProfileData = {
      first_name: 'John',
      last_name: 'Doe',
      dob: '1990-01-01',
      address_line1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
    };

    it('creates profile for authenticated user', async () => {
      const mockUser = { id: 'user-123' };
      const mockProfile = {
        user_id: 'user-123',
        ...validProfileData,
        is_minor: false,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { status, json } = await callRoute(PUT, 'POST', 'http://localhost/api/profile', {
        body: JSON.stringify(validProfileData),
      });

      expect(status).toBe(200);
      expect(json).toEqual(mockProfile);
    });

    it('returns 400 for missing required fields', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const incompleteData = {
        first_name: 'John',
        // Missing other required fields
      };

      const { status, json } = await callRoute(PUT, 'POST', 'http://localhost/api/profile', {
        body: JSON.stringify(incompleteData),
      });

      expect(status).toBe(400);
      expect(json.error).toBe('Missing required fields');
      expect(json.missing).toContain('last_name');
    });

    it('calculates is_minor correctly for minor user', async () => {
      const mockUser = { id: 'user-123' };
      const minorProfileData = {
        ...validProfileData,
        dob: '2010-01-01', // 14 years old
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...minorProfileData, user_id: 'user-123' },
              error: null,
            }),
          }),
        }),
      });

      const { status, json } = await callRoute(PUT, 'POST', 'http://localhost/api/profile', {
        body: JSON.stringify(minorProfileData),
      });

      expect(status).toBe(200);
      expect(json.is_minor).toBe(true);
    });

    it('returns 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { status, json } = await callRoute(PUT, 'POST', 'http://localhost/api/profile', {
        body: JSON.stringify(validProfileData),
      });

      expect(status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 500 for database error', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const { status, json } = await callRoute(PUT, 'POST', 'http://localhost/api/profile', {
        body: JSON.stringify(validProfileData),
      });

      expect(status).toBe(500);
      expect(json).toEqual({ error: 'Database error' });
    });
  });

  describe('PATCH /api/profile', () => {
    it('updates profile for authenticated user', async () => {
      const mockUser = { id: 'user-123' };
      const updateData = {
        first_name: 'Jane',
        locale: 'en',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const { status, json } = await callRoute(PATCH, 'PATCH', 'http://localhost/api/profile', {
        body: JSON.stringify(updateData),
      });

      expect(status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it('returns 400 for invalid locale', async () => {
      const mockUser = { id: 'user-123' };
      const updateData = {
        locale: 'invalid-locale',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { status, json } = await callRoute(PATCH, 'PATCH', 'http://localhost/api/profile', {
        body: JSON.stringify(updateData),
      });

      expect(status).toBe(400);
      expect(json).toEqual({ error: 'Invalid locale' });
    });

    it('returns 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { status, json } = await callRoute(PATCH, 'PATCH', 'http://localhost/api/profile', {
        body: JSON.stringify({ first_name: 'Jane' }),
      });

      expect(status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 500 for database error', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      const { status, json } = await callRoute(PATCH, 'PATCH', 'http://localhost/api/profile', {
        body: JSON.stringify({ first_name: 'Jane' }),
      });

      expect(status).toBe(500);
      expect(json).toEqual({ error: 'Failed to update profile' });
    });

    it('handles update without locale', async () => {
      const mockUser = { id: 'user-123' };
      const updateData = {
        first_name: 'Jane',
        last_name: 'Smith',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const { status, json } = await callRoute(PATCH, 'PATCH', 'http://localhost/api/profile', {
        body: JSON.stringify(updateData),
      });

      expect(status).toBe(200);
      expect(json).toEqual({ success: true });
    });
  });
});
