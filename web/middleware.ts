import {NextRequest, NextResponse} from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import {locales, defaultLocale, localePrefix} from './i18n/request';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix
});

export default async function middleware(req: NextRequest) {
  // First apply locale routing
  const res = intlMiddleware(req);

  // Preserve existing Supabase session refresh
  try {
    const supabase = createMiddlewareClient({ req, res });
    await supabase.auth.getSession();
  } catch {
    // no-op on edge errors
  }

  return res as NextResponse;
}

export const config = {
  // Only apply i18n to root and localized marketing routes; skip API and assets
  matcher: ['/', '/(en|es)/:path*']
};


