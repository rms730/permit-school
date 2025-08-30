// Ensure env schema is evaluated during build/CI (fails fast on misconfig)
import '@/env';

import type { Metadata } from "next";
import { Inter, Rubik } from 'next/font/google';
import * as React from "react";

import { getDictionary } from "@/lib/i18n";
import { getLocaleFromRequest } from "@/lib/i18n/server";

import ClientProviders from "./ClientProviders";

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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [{ rel: 'mask-icon', url: '/icons/maskable-512.png', color: '#1976d2' }]
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

export function generateViewport() {
  return {
    themeColor: '#1976d2',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromRequest();
  const dict = getDictionary(locale);

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${rubik.variable}`}>
        <ClientProviders locale={locale} dict={dict}>
          <main id="main" role="main" tabIndex={-1}>
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
        </ClientProviders>
      </body>
    </html>
  );
}
