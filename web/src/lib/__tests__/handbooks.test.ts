import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHandbookSignedUrl } from '../handbooks';

// Mock Supabase server client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
  storage: {
    from: vi.fn(() => ({
      createSignedUrl: vi.fn(),
    })),
  },
};

vi.mock('@/lib/supabaseServer', () => ({
  getServerClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('handbooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHandbookSignedUrl', () => {
    it('returns signed URL and filename when successful', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/ca-drivers-handbook.pdf',
        filename: 'ca-drivers-handbook.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      const result = await getHandbookSignedUrl('handbook-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('handbook_sources');
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('handbooks');
      expect(result).toEqual({
        url: 'https://example.com/signed-url',
        filename: 'ca-drivers-handbook.pdf',
      });
    });

    it('uses default expiration time when not provided', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/tx-drivers-handbook.pdf',
        filename: 'tx-drivers-handbook.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url-2',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      await getHandbookSignedUrl('handbook-456');

      expect(mockSupabase.storage.from().createSignedUrl).toHaveBeenCalledWith(
        'handbooks/tx-drivers-handbook.pdf',
        3600
      );
    });

    it('uses custom expiration time when provided', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/ny-drivers-handbook.pdf',
        filename: 'ny-drivers-handbook.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url-3',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      await getHandbookSignedUrl('handbook-789', 7200);

      expect(mockSupabase.storage.from().createSignedUrl).toHaveBeenCalledWith(
        'handbooks/ny-drivers-handbook.pdf',
        7200
      );
    });

    it('throws error when database query fails', async () => {
      const dbError = new Error('Database error');

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: dbError,
            }),
          }),
        }),
      });

      await expect(getHandbookSignedUrl('invalid-id')).rejects.toThrow('Database error');

      expect(mockSupabase.storage.from).not.toHaveBeenCalled();
    });

    it('throws error when storage signed URL creation fails', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/fl-drivers-handbook.pdf',
        filename: 'fl-drivers-handbook.pdf',
      };

      const storageError = new Error('Storage error');

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: null,
          error: storageError,
        }),
      });

      await expect(getHandbookSignedUrl('handbook-999')).rejects.toThrow('Storage error');
    });

    it('handles different handbook IDs', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/wa-drivers-handbook.pdf',
        filename: 'wa-drivers-handbook.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url-4',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      const result = await getHandbookSignedUrl('handbook-wa');

      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('id', 'handbook-wa');
      expect(result).toEqual({
        url: 'https://example.com/signed-url-4',
        filename: 'wa-drivers-handbook.pdf',
      });
    });

    it('handles different storage paths', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/or/2024/drivers-handbook.pdf',
        filename: 'or-drivers-handbook-2024.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url-5',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      await getHandbookSignedUrl('handbook-or');

      expect(mockSupabase.storage.from().createSignedUrl).toHaveBeenCalledWith(
        'handbooks/or/2024/drivers-handbook.pdf',
        3600
      );
    });

    it('handles edge case with zero expiration time', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/az-drivers-handbook.pdf',
        filename: 'az-drivers-handbook.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url-6',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      await getHandbookSignedUrl('handbook-az', 0);

      expect(mockSupabase.storage.from().createSignedUrl).toHaveBeenCalledWith(
        'handbooks/az-drivers-handbook.pdf',
        0
      );
    });

    it('handles edge case with negative expiration time', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/co-drivers-handbook.pdf',
        filename: 'co-drivers-handbook.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url-7',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      await getHandbookSignedUrl('handbook-co', -100);

      expect(mockSupabase.storage.from().createSignedUrl).toHaveBeenCalledWith(
        'handbooks/co-drivers-handbook.pdf',
        -100
      );
    });

    it('handles edge case with very large expiration time', async () => {
      const mockHandbookData = {
        storage_path: 'handbooks/nv-drivers-handbook.pdf',
        filename: 'nv-drivers-handbook.pdf',
      };

      const mockSignedUrl = {
        signedUrl: 'https://example.com/signed-url-8',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockHandbookData,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.storage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: mockSignedUrl,
          error: null,
        }),
      });

      await getHandbookSignedUrl('handbook-nv', 86400); // 24 hours

      expect(mockSupabase.storage.from().createSignedUrl).toHaveBeenCalledWith(
        'handbooks/nv-drivers-handbook.pdf',
        86400
      );
    });
  });
});
