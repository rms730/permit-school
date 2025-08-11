/**
 * Offline mode utilities
 * Handles detection and configuration for offline development
 */

export const isOfflineMode = (): boolean => {
  return process.env.OFFLINE_DEV === '1';
};

export const getOfflineConfig = () => {
  const offline = isOfflineMode();
  
  return {
    offline,
    // Disable external services in offline mode
    sentry: offline ? false : !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    resend: offline ? false : !!process.env.RESEND_API_KEY,
    stripe: offline ? false : !!process.env.STRIPE_SECRET_KEY,
    googleOneTap: offline ? false : process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP === '1',
    // Use local Supabase in offline mode
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
};

/**
 * Log offline mode status to console
 */
export const logOfflineStatus = () => {
  if (isOfflineMode()) {
    console.log('🚀 Offline Mode Active');
    console.log('   • External services disabled');
    console.log('   • Using local Supabase');
    console.log('   • Test data available');
  }
};

/**
 * Get offline mode badge text
 */
export const getOfflineBadgeText = (): string => {
  return isOfflineMode() ? 'OFFLINE' : '';
};

/**
 * Check if a feature should be disabled in offline mode
 */
export const isFeatureDisabled = (feature: 'sentry' | 'resend' | 'stripe' | 'googleOneTap'): boolean => {
  if (!isOfflineMode()) return false;
  
  switch (feature) {
    case 'sentry':
    case 'resend':
    case 'stripe':
    case 'googleOneTap':
      return true;
    default:
      return false;
  }
};
