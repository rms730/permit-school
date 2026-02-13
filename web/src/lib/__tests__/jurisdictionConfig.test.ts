import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getJurisdictionConfig, type JurisdictionConfig } from '../jurisdictionConfig';

// Mock Supabase route client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
};

vi.mock('../supabaseRoute', () => ({
  getRouteClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('jurisdictionConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.FINAL_EXAM_NUM_QUESTIONS;
    delete process.env.FINAL_EXAM_PASS_PCT;
    delete process.env.FINAL_EXAM_MINUTES_REQUIRED;
  });

  describe('getJurisdictionConfig', () => {
    it('returns config from database when available', async () => {
      const mockConfig: JurisdictionConfig = {
        final_exam_questions: 25,
        final_exam_pass_pct: 0.85,
        seat_time_required_minutes: 120,
        certificate_prefix: 'CA',
        certificate_issuer_name: 'California DMV',
        certificate_issuer_license: 'CA123456',
        disclaimer: 'Test disclaimer',
        support_email: 'support@ca.gov',
        support_phone: '1-800-CA-DMV',
        terms_url: 'https://ca.gov/terms',
        privacy_url: 'https://ca.gov/privacy',
        regulatory_signing_secret: 'secret123',
        fulfillment_low_stock_threshold: 100,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockConfig,
              error: null,
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('CA');

      expect(mockSupabase.from).toHaveBeenCalledWith('jurisdiction_configs');
      expect(result).toEqual(mockConfig);
    });

    it('falls back to environment variables when database query fails', async () => {
      process.env.FINAL_EXAM_NUM_QUESTIONS = '40';
      process.env.FINAL_EXAM_PASS_PCT = '0.75';
      process.env.FINAL_EXAM_MINUTES_REQUIRED = '180';

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('TX');

      expect(result).toEqual({
        final_exam_questions: 40,
        final_exam_pass_pct: 0.75,
        seat_time_required_minutes: 180,
        certificate_prefix: 'TX',
      });
    });

    it('falls back to environment variables when database query returns null', async () => {
      process.env.FINAL_EXAM_NUM_QUESTIONS = '35';
      process.env.FINAL_EXAM_PASS_PCT = '0.9';
      process.env.FINAL_EXAM_MINUTES_REQUIRED = '200';

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('NY');

      expect(result).toEqual({
        final_exam_questions: 35,
        final_exam_pass_pct: 0.9,
        seat_time_required_minutes: 200,
        certificate_prefix: 'NY',
      });
    });

    it('uses default values when environment variables are not set', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('FL');

      expect(result).toEqual({
        final_exam_questions: 30,
        final_exam_pass_pct: 0.8,
        seat_time_required_minutes: 150,
        certificate_prefix: 'FL',
      });
    });

    it('handles database errors and falls back to environment variables', async () => {
      process.env.FINAL_EXAM_NUM_QUESTIONS = '50';
      process.env.FINAL_EXAM_PASS_PCT = '0.7';
      process.env.FINAL_EXAM_MINUTES_REQUIRED = '300';

      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getJurisdictionConfig('WA');

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching jurisdiction config:', expect.any(Error));
      expect(result).toEqual({
        final_exam_questions: 50,
        final_exam_pass_pct: 0.7,
        seat_time_required_minutes: 300,
        certificate_prefix: 'WA',
      });

      consoleSpy.mockRestore();
    });

    it('handles partial environment variable configuration', async () => {
      process.env.FINAL_EXAM_NUM_QUESTIONS = '45';
      // Don't set other env vars

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('OR');

      expect(result).toEqual({
        final_exam_questions: 45,
        final_exam_pass_pct: 0.8, // default
        seat_time_required_minutes: 150, // default
        certificate_prefix: 'OR',
      });
    });

    it('handles invalid environment variable values gracefully', async () => {
      process.env.FINAL_EXAM_NUM_QUESTIONS = 'invalid';
      process.env.FINAL_EXAM_PASS_PCT = 'not-a-number';
      process.env.FINAL_EXAM_MINUTES_REQUIRED = '';

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('NV');

      expect(result).toEqual({
        final_exam_questions: NaN, // parseInt('invalid') returns NaN
        final_exam_pass_pct: NaN, // parseFloat('not-a-number') returns NaN
        seat_time_required_minutes: 150, // parseInt('') returns NaN, but || '150' makes it 150
        certificate_prefix: 'NV',
      });
    });

    it('handles zero values in environment variables', async () => {
      process.env.FINAL_EXAM_NUM_QUESTIONS = '0';
      process.env.FINAL_EXAM_PASS_PCT = '0';
      process.env.FINAL_EXAM_MINUTES_REQUIRED = '0';

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('AZ');

      expect(result).toEqual({
        final_exam_questions: 0,
        final_exam_pass_pct: 0,
        seat_time_required_minutes: 0,
        certificate_prefix: 'AZ',
      });
    });

    it('handles negative values in environment variables', async () => {
      process.env.FINAL_EXAM_NUM_QUESTIONS = '-10';
      process.env.FINAL_EXAM_PASS_PCT = '-0.5';
      process.env.FINAL_EXAM_MINUTES_REQUIRED = '-30';

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getJurisdictionConfig('CO');

      expect(result).toEqual({
        final_exam_questions: -10,
        final_exam_pass_pct: -0.5,
        seat_time_required_minutes: -30,
        certificate_prefix: 'CO',
      });
    });
  });

  describe('JurisdictionConfig interface', () => {
    it('supports all required fields', () => {
      const config: JurisdictionConfig = {
        final_exam_questions: 30,
        final_exam_pass_pct: 0.8,
        seat_time_required_minutes: 150,
        certificate_prefix: 'CA',
      };

      expect(config.final_exam_questions).toBe(30);
      expect(config.final_exam_pass_pct).toBe(0.8);
      expect(config.seat_time_required_minutes).toBe(150);
      expect(config.certificate_prefix).toBe('CA');
    });

    it('supports all optional fields', () => {
      const config: JurisdictionConfig = {
        final_exam_questions: 30,
        final_exam_pass_pct: 0.8,
        seat_time_required_minutes: 150,
        certificate_prefix: 'CA',
        certificate_issuer_name: 'Test Issuer',
        certificate_issuer_license: 'LIC123',
        disclaimer: 'Test disclaimer',
        support_email: 'support@test.com',
        support_phone: '1-800-TEST',
        terms_url: 'https://test.com/terms',
        privacy_url: 'https://test.com/privacy',
        regulatory_signing_secret: 'secret123',
        fulfillment_low_stock_threshold: 50,
      };

      expect(config.certificate_issuer_name).toBe('Test Issuer');
      expect(config.certificate_issuer_license).toBe('LIC123');
      expect(config.disclaimer).toBe('Test disclaimer');
      expect(config.support_email).toBe('support@test.com');
      expect(config.support_phone).toBe('1-800-TEST');
      expect(config.terms_url).toBe('https://test.com/terms');
      expect(config.privacy_url).toBe('https://test.com/privacy');
      expect(config.regulatory_signing_secret).toBe('secret123');
      expect(config.fulfillment_low_stock_threshold).toBe(50);
    });
  });
});
