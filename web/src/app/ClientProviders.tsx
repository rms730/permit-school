"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import * as React from 'react';

import ConsoleTap from "@/components/dev/ConsoleTap";
import OfflineModeIndicator from "@/components/OfflineModeIndicator";
import { SkipLink } from "@/components/SkipLink";
import { type SupportedLocale, type Dictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

import MuiProvider from "./providers/MuiProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
  locale: SupportedLocale;
  dict: Dictionary;
}

export default function ClientProviders({ children, locale, dict }: ClientProvidersProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: false }}>
      <MuiProvider>
        <I18nProvider locale={locale} dict={dict}>
          {process.env.NEXT_PUBLIC_DEV_CONSOLE_TAP === '1' ? <ConsoleTap /> : null}
          <SkipLink />
          <OfflineModeIndicator />
          {children}
        </I18nProvider>
      </MuiProvider>
    </AppRouterCacheProvider>
  );
}
