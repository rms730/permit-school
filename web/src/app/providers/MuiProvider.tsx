"use client";

import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import * as React from "react";

import { createModernTheme, type ThemeMode } from "@/theme/modernTheme";

const THEME_STORAGE_KEY = "permit_school_theme_mode";

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeModeContext = React.createContext<ThemeModeContextValue | null>(null);

function getStoredThemeMode(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === "light" || raw === "dark") {
    return raw;
  }

  return null;
}

function getPreferredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useThemeMode(): ThemeModeContextValue {
  const context = React.useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within MuiProvider");
  }
  return context;
}

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>("light");
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const storedMode = getStoredThemeMode();
    setModeState(storedMode ?? getPreferredThemeMode());
    setIsReady(true);
  }, []);

  React.useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode, isReady]);

  const setMode = React.useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const toggleMode = React.useCallback(() => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const theme = React.useMemo(() => createModernTheme(mode), [mode]);
  const contextValue = React.useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            ":root": {
              colorScheme: mode,
            },
            main: {
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            },
            "section[id]": {
              scrollMarginTop: "96px",
            },
          }}
        />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
