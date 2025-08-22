import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale, isValidLocale } from './locales';

// Re-export types for convenience
export type { SupportedLocale } from './locales';

const dictionaries = {
  en,
  es,
} as const;

export type Dictionary = typeof en;

export function getDictionary(locale: SupportedLocale): Dictionary {
  return dictionaries[locale];
}

export function getLocaleFromProfile(profileLocale?: string | null): SupportedLocale {
  if (profileLocale && isValidLocale(profileLocale)) {
    return profileLocale;
  }
  return DEFAULT_LOCALE;
}

// Client-side locale detection (for use in client components)
export function getLocaleFromCookie(): SupportedLocale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('lang='))
    ?.split('=')[1];
    
  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }
  
  return DEFAULT_LOCALE;
}

// Set locale cookie (client-side)
export function setLocaleCookie(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `lang=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
