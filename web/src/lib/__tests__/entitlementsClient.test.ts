import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEntitlementForUserClient } from '../entitlementsClient';

// Mock Supabase browser client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
};

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createPagesBrowserClient: vi.fn(() => mockSupabase),
}));

describe('entitlementsClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEntitlementForUserClient', () => {
    it('returns active entitlement when user is authenticated and has active entitlement', async () => {
      const mockUser = { id: 'user-123' };
      const mockEntitlement = { active: true };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockEntitlement,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getEntitlementForUserClient('CA');

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('v_user_entitlements');
      expect(result).toEqual({ active: true });
    });

    it('returns inactive entitlement when user is authenticated but has inactive entitlement', async () => {
      const mockUser = { id: 'user-123' };
      const mockEntitlement = { active: false };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockEntitlement,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getEntitlementForUserClient('TX');

      expect(result).toEqual({ active: false });
    });

    it('returns inactive entitlement when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getEntitlementForUserClient('NY');

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result).toEqual({ active: false });
    });

    it('returns inactive entitlement when authentication fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Authentication failed' },
      });

      const result = await getEntitlementForUserClient('FL');

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result).toEqual({ active: false });
    });

    it('returns inactive entitlement when database query fails', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      });

      const result = await getEntitlementForUserClient('WA');

      expect(mockSupabase.from).toHaveBeenCalledWith('v_user_entitlements');
      expect(result).toEqual({ active: false });
    });

    it('returns inactive entitlement when no entitlement found', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getEntitlementForUserClient('OR');

      expect(result).toEqual({ active: false });
    });

    it('uses default jurisdiction code when none provided', async () => {
      const mockUser = { id: 'user-123' };
      const mockEntitlement = { active: true };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockEntitlement,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getEntitlementForUserClient();

      expect(mockSupabase.from).toHaveBeenCalledWith('v_user_entitlements');
      expect(result).toEqual({ active: true });
    });

    it('handles different jurisdiction codes', async () => {
      const mockUser = { id: 'user-123' };
      const mockEntitlement = { active: true };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockEntitlement,
                error: null,
              }),
            }),
          }),
        }),
      });

      const jurisdictions = ['CA', 'TX', 'NY', 'FL', 'WA', 'OR', 'AZ', 'CO'];
      
      for (const jCode of jurisdictions) {
        const result = await getEntitlementForUserClient(jCode);
        expect(result).toEqual({ active: true });
      }
    });

    it('handles database query with correct parameters', async () => {
      const mockUser = { id: 'user-456' };
      const mockEntitlement = { active: false };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEntitlement,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await getEntitlementForUserClient('NV');

      expect(mockSupabase.from).toHaveBeenCalledWith('v_user_entitlements');
      expect(mockSelect).toHaveBeenCalledWith('active');
      
      const mockEq1 = mockSupabase.from().select().eq;
      expect(mockEq1).toHaveBeenCalledWith('user_id', 'user-456');
      
      const mockEq2 = mockSupabase.from().select().eq().eq;
      expect(mockEq2).toHaveBeenCalledWith('j_code', 'NV');
    });

    it('handles edge case with empty user ID', async () => {
      const mockUser = { id: '' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getEntitlementForUserClient('CA');

      expect(result).toEqual({ active: false });
    });

    it('handles edge case with null user object', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getEntitlementForUserClient('TX');

      expect(result).toEqual({ active: false });
    });

    it('handles edge case with undefined user object', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: undefined },
        error: null,
      });

      const result = await getEntitlementForUserClient('NY');

      expect(result).toEqual({ active: false });
    });
  });
});
