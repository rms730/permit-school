import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import {NextRequest, NextResponse} from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import {locales, defaultLocale, localePrefix} from './i18n/request';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix
});

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for static assets and PWA files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/icons/') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/workbox-')
  ) {
    return NextResponse.next();
  }

  // Apply locale routing for other requests
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
  /*
   * Exclude Next.js internals, static files, and PWA assets from locale routing
   */
  matcher: [
    '/((?!_next|static|favicon\\.ico|manifest\\.webmanifest|icons/.*|robots\\.txt|sitemap\\.xml|sw\\.js|workbox-.*).*)'
  ]
};


