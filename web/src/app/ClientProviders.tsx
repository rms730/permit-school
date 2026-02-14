"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import * as React from 'react';

import ConsoleTap from "@/components/dev/ConsoleTap";
import OfflineModeIndicator from "@/components/OfflineModeIndicator";
import { SkipLink } from "@/components/SkipLink";
import { type SupportedLocale, type Dictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

import { DialogProvider } from "./providers/DialogProvider";
import MuiProvider from "./providers/MuiProvider";
import { SnackbarProvider } from "./providers/SnackbarProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
  locale: SupportedLocale;
  dict: Dictionary;
}

export default function ClientProviders({ children, locale, dict }: ClientProvidersProps) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      })
      .catch(() => {
        // no-op: best effort cleanup for stale local caches
      });

    if ('caches' in window) {
      window.caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => window.caches.delete(key))))
        .catch(() => {
          // no-op: best effort cleanup for stale local caches
        });
    }
  }, []);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: false }}>
      <MuiProvider>
        <I18nProvider locale={locale} dict={dict}>
          <SnackbarProvider>
            <DialogProvider>
              {process.env.NEXT_PUBLIC_DEV_CONSOLE_TAP === '1' ? <ConsoleTap /> : null}
              <SkipLink />
              <OfflineModeIndicator />
              {children}
            </DialogProvider>
          </SnackbarProvider>
        </I18nProvider>
      </MuiProvider>
    </AppRouterCacheProvider>
  );
}
