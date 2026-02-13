import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isOfflineMode, 
  getOfflineConfig, 
  logOfflineStatus, 
  getOfflineBadgeText, 
  isFeatureDisabled 
} from '../offline';

describe('offline', () => {
  const originalEnv = process.env;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    // Mock console.log
    console.log = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
  });

  describe('isOfflineMode', () => {
    it('returns true when OFFLINE_DEV is set to 1', () => {
      process.env.OFFLINE_DEV = '1';
      expect(isOfflineMode()).toBe(true);
    });

    it('returns false when OFFLINE_DEV is not set', () => {
      delete process.env.OFFLINE_DEV;
      expect(isOfflineMode()).toBe(false);
    });

    it('returns false when OFFLINE_DEV is set to other values', () => {
      process.env.OFFLINE_DEV = '0';
      expect(isOfflineMode()).toBe(false);

      process.env.OFFLINE_DEV = 'true';
      expect(isOfflineMode()).toBe(false);

      process.env.OFFLINE_DEV = 'false';
      expect(isOfflineMode()).toBe(false);

      process.env.OFFLINE_DEV = '';
      expect(isOfflineMode()).toBe(false);
    });
  });

  describe('getOfflineConfig', () => {
    it('returns correct config when offline mode is enabled', () => {
      process.env.OFFLINE_DEV = '1';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-sentry-dsn';
      process.env.RESEND_API_KEY = 'test-resend-key';
      process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
      process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP = '1';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const config = getOfflineConfig();

      expect(config).toEqual({
        offline: true,
        sentry: false,
        resend: false,
        stripe: false,
        googleOneTap: false,
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      });
    });

    it('returns correct config when offline mode is disabled', () => {
      delete process.env.OFFLINE_DEV;
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-sentry-dsn';
      process.env.RESEND_API_KEY = 'test-resend-key';
      process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
      process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP = '1';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const config = getOfflineConfig();

      expect(config).toEqual({
        offline: false,
        sentry: true,
        resend: true,
        stripe: true,
        googleOneTap: true,
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      });
    });

    it('uses default values when environment variables are not set', () => {
      delete process.env.OFFLINE_DEV;
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      delete process.env.RESEND_API_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const config = getOfflineConfig();

      expect(config).toEqual({
        offline: false,
        sentry: false,
        resend: false,
        stripe: false,
        googleOneTap: false,
        supabaseUrl: 'http://localhost:54321',
        supabaseAnonKey: '',
      });
    });

    it('handles partial environment variable configuration', () => {
      delete process.env.OFFLINE_DEV;
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-sentry-dsn';
      delete process.env.RESEND_API_KEY;
      process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
      delete process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP;
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const config = getOfflineConfig();

      expect(config).toEqual({
        offline: false,
        sentry: true,
        resend: false,
        stripe: true,
        googleOneTap: false,
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: '',
      });
    });
  });

  describe('logOfflineStatus', () => {
    it('logs offline status when offline mode is enabled', () => {
      process.env.OFFLINE_DEV = '1';

      logOfflineStatus();

      expect(console.log).toHaveBeenCalledWith('🚀 Offline Mode Active');
      expect(console.log).toHaveBeenCalledWith('   • External services disabled');
      expect(console.log).toHaveBeenCalledWith('   • Using local Supabase');
      expect(console.log).toHaveBeenCalledWith('   • Test data available');
      expect(console.log).toHaveBeenCalledTimes(4);
    });

    it('does not log anything when offline mode is disabled', () => {
      delete process.env.OFFLINE_DEV;

      logOfflineStatus();

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('getOfflineBadgeText', () => {
    it('returns "OFFLINE" when offline mode is enabled', () => {
      process.env.OFFLINE_DEV = '1';
      expect(getOfflineBadgeText()).toBe('OFFLINE');
    });

    it('returns empty string when offline mode is disabled', () => {
      delete process.env.OFFLINE_DEV;
      expect(getOfflineBadgeText()).toBe('');
    });

    it('returns empty string when OFFLINE_DEV is set to other values', () => {
      process.env.OFFLINE_DEV = '0';
      expect(getOfflineBadgeText()).toBe('');

      process.env.OFFLINE_DEV = 'true';
      expect(getOfflineBadgeText()).toBe('');

      process.env.OFFLINE_DEV = 'false';
      expect(getOfflineBadgeText()).toBe('');
    });
  });

  describe('isFeatureDisabled', () => {
    it('returns true for all features when offline mode is enabled', () => {
      process.env.OFFLINE_DEV = '1';

      expect(isFeatureDisabled('sentry')).toBe(true);
      expect(isFeatureDisabled('resend')).toBe(true);
      expect(isFeatureDisabled('stripe')).toBe(true);
      expect(isFeatureDisabled('googleOneTap')).toBe(true);
    });

    it('returns false for all features when offline mode is disabled', () => {
      delete process.env.OFFLINE_DEV;

      expect(isFeatureDisabled('sentry')).toBe(false);
      expect(isFeatureDisabled('resend')).toBe(false);
      expect(isFeatureDisabled('stripe')).toBe(false);
      expect(isFeatureDisabled('googleOneTap')).toBe(false);
    });

    it('handles different OFFLINE_DEV values correctly', () => {
      const testCases = [
        { value: '0', expected: false },
        { value: 'true', expected: false },
        { value: 'false', expected: false },
        { value: '', expected: false },
        { value: '1', expected: true },
      ];

      testCases.forEach(({ value, expected }) => {
        process.env.OFFLINE_DEV = value;
        expect(isFeatureDisabled('sentry')).toBe(expected);
      });
    });
  });

  describe('integration', () => {
    it('all functions work together consistently', () => {
      process.env.OFFLINE_DEV = '1';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-sentry-dsn';
      process.env.RESEND_API_KEY = 'test-resend-key';

      // Test all functions in offline mode
      expect(isOfflineMode()).toBe(true);
      expect(getOfflineBadgeText()).toBe('OFFLINE');
      expect(isFeatureDisabled('sentry')).toBe(true);
      expect(isFeatureDisabled('resend')).toBe(true);

      const config = getOfflineConfig();
      expect(config.offline).toBe(true);
      expect(config.sentry).toBe(false);
      expect(config.resend).toBe(false);

      logOfflineStatus();
      expect(console.log).toHaveBeenCalledWith('🚀 Offline Mode Active');
    });

    it('all functions work together consistently in online mode', () => {
      delete process.env.OFFLINE_DEV;
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-sentry-dsn';
      process.env.RESEND_API_KEY = 'test-resend-key';

      // Test all functions in online mode
      expect(isOfflineMode()).toBe(false);
      expect(getOfflineBadgeText()).toBe('');
      expect(isFeatureDisabled('sentry')).toBe(false);
      expect(isFeatureDisabled('resend')).toBe(false);

      const config = getOfflineConfig();
      expect(config.offline).toBe(false);
      expect(config.sentry).toBe(true);
      expect(config.resend).toBe(true);

      logOfflineStatus();
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
