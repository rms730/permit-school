import * as React from "react";
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { esES } from "@mui/material/locale";
import theme from "@/theme";
import { getLocaleFromRequest } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "Permit School — Tutor",
  description: "Ask the CA Driver Handbook with hybrid RAG.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromRequest();
  const dict = getDictionary(locale);
  
  // Create theme with locale-specific settings
  const localeTheme = locale === 'es' 
    ? { ...theme, components: { ...theme.components } }
    : theme;

  return (
    <html lang={locale}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={localeTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <I18nProvider locale={locale} dict={dict}>
                <CssBaseline />
                {children}
              </I18nProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
