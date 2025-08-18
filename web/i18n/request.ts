export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const pathnames = {
  '/': '/',
} as const;

export const localePrefix = 'always';

// Provide request-time config so next-intl can load messages on the server
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Ensure a supported locale
  const current = locales.includes(locale as any) ? (locale as Locale) : defaultLocale;
  const messages = (await import(`../messages/${current}.json`)).default;
  return {messages, locale: current};
});


