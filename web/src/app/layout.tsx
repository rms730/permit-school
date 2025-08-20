// Ensure env schema is evaluated during build/CI (fails fast on misconfig)
import '@/env';

import * as React from "react";
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { esES } from "@mui/material/locale";
import { Inter, Rubik } from 'next/font/google';
import MuiProvider from "./providers/MuiProvider";
import { getLocaleFromRequest } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { SkipLink } from "@/components/SkipLink";
import OfflineModeIndicator from "@/components/OfflineModeIndicator";

// Load Google Fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: "Permit School — Learn to Drive in California",
  description: "Comprehensive driver education for California permit test. Interactive lessons, practice tests, and expert tutoring.",
  keywords: "California driver permit, driver education, driving test, DMV practice test",
  authors: [{ name: "Permit School" }],
  creator: "Permit School",
  publisher: "Permit School",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://permit-school.com'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#1976d2',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Permit School',
  },
  openGraph: {
    title: "Permit School — Learn to Drive in California",
    description: "Comprehensive driver education for California permit test. Interactive lessons, practice tests, and expert tutoring.",
    url: '/',
    siteName: 'Permit School',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Permit School — Learn to Drive in California",
    description: "Comprehensive driver education for California permit test. Interactive lessons, practice tests, and expert tutoring.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromRequest();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${inter.variable} ${rubik.variable}`}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <MuiProvider>
            <I18nProvider locale={locale} dict={dict}>
                <SkipLink />
                <OfflineModeIndicator />
                <main id="main" role="main">
                  {children}
                </main>
                <footer role="contentinfo" style={{ marginTop: 'auto', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
                  <p>&copy; {new Date().getFullYear()} Permit School. All rights reserved.</p>
                  <nav aria-label="Footer navigation">
                    <a href="/privacy" style={{ margin: '0 1rem', color: '#666', textDecoration: 'none' }}>Privacy</a>
                    <a href="/terms" style={{ margin: '0 1rem', color: '#666', textDecoration: 'none' }}>Terms</a>
                    <a href="/accessibility" style={{ margin: '0 1rem', color: '#666', textDecoration: 'none' }}>Accessibility</a>
                  </nav>
                </footer>
              </I18nProvider>
          </MuiProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
