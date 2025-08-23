import { cookies, headers } from 'next/headers';

import { DEFAULT_LOCALE, type SupportedLocale, isValidLocale } from './locales';

import { getDictionary } from './index';

export async function getLocaleFromRequest(): Promise<SupportedLocale> {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // 1. Check cookie first
  const cookieLang = cookieStore.get('lang')?.value;
  if (cookieLang && isValidLocale(cookieLang)) {
    return cookieLang;
  }
  
  // 2. Check user profile locale (if authenticated)
  try {
    const { getRouteClient } = await import('@/lib/supabaseRoute');
    const supabase = await getRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('locale')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.locale && isValidLocale(profile.locale)) {
        return profile.locale;
      }
    }
  } catch (error) {
    // Silently fall back to other methods
    console.warn('Error checking profile locale:', error);
  }
  
  // 3. Check Accept-Language header
  const acceptLanguage = headersList.get('accept-language');
  if (acceptLanguage) {
    const preferredLang = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .find(lang => isValidLocale(lang) || lang.startsWith('es'));
    
    if (preferredLang) {
      if (isValidLocale(preferredLang)) {
        return preferredLang;
      }
      if (preferredLang.startsWith('es')) {
        return 'es';
      }
    }
  }
  
  return DEFAULT_LOCALE;
}

// Server utility for wrapping handlers with i18n context
export async function withI18nSSR<T>(
  handler: (params: { locale: SupportedLocale; dict: ReturnType<typeof getDictionary> }) => Promise<T>
): Promise<T> {
  const locale = await getLocaleFromRequest();
  const dict = getDictionary(locale);
  return handler({ locale, dict });
}
