import type { PaletteMode } from "@mui/material";
import { alpha, createTheme } from "@mui/material/styles";

export type ThemeMode = Extract<PaletteMode, "light" | "dark">;

export function createModernTheme(mode: ThemeMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#5faeff" : "#0f6ecf",
        light: isDark ? "#8fc5ff" : "#3b8be0",
        dark: isDark ? "#2f7fd0" : "#0a4f95",
        contrastText: "#ffffff",
      },
      secondary: {
        main: isDark ? "#38b39a" : "#17866f",
        light: isDark ? "#67ceb8" : "#33a08a",
        dark: isDark ? "#1e7f6b" : "#0f5f4f",
        contrastText: "#ffffff",
      },
      success: {
        main: isDark ? "#46c98a" : "#1f9d66",
        light: isDark ? "#70dba6" : "#35b17c",
        dark: isDark ? "#258b5a" : "#137048",
      },
      warning: {
        main: isDark ? "#e2a14a" : "#c97f18",
        light: isDark ? "#ebb977" : "#e19b3d",
        dark: isDark ? "#ac7026" : "#925c11",
      },
      error: {
        main: isDark ? "#e0717e" : "#c43b4a",
        light: isDark ? "#ea97a1" : "#d85a67",
        dark: isDark ? "#aa4955" : "#932b37",
      },
      text: {
        primary: isDark ? "#e7eef8" : "#122032",
        secondary: isDark ? "#a9bbd1" : "#4a5c74",
      },
      background: {
        default: isDark ? "#0a1220" : "#f7fafc",
        paper: isDark ? "#121d30" : "#ffffff",
      },
      divider: isDark ? "rgba(231, 238, 248, 0.16)" : "rgba(18, 32, 50, 0.16)",
    },
    typography: {
      fontFamily: 'var(--font-sans, "Manrope"), "Avenir Next", "Segoe UI", sans-serif',
      h1: {
        fontFamily: 'var(--font-display, "Sora"), "Avenir Next", "Segoe UI", sans-serif',
        fontWeight: 700,
        fontSize: "clamp(2.2rem, 1.5rem + 2.4vw, 3.55rem)",
        lineHeight: 1.08,
        letterSpacing: "-0.03em",
      },
      h2: {
        fontFamily: 'var(--font-display, "Sora"), "Avenir Next", "Segoe UI", sans-serif',
        fontWeight: 700,
        fontSize: "clamp(1.8rem, 1.25rem + 1.8vw, 2.8rem)",
        lineHeight: 1.12,
        letterSpacing: "-0.02em",
      },
      h3: {
        fontFamily: 'var(--font-display, "Sora"), "Avenir Next", "Segoe UI", sans-serif',
        fontWeight: 600,
        fontSize: "clamp(1.45rem, 1.15rem + 1vw, 2rem)",
        lineHeight: 1.18,
      },
      h4: {
        fontFamily: 'var(--font-display, "Sora"), "Avenir Next", "Segoe UI", sans-serif',
        fontWeight: 600,
        fontSize: "1.35rem",
        lineHeight: 1.24,
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.12rem",
        lineHeight: 1.35,
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
        lineHeight: 1.38,
      },
      body1: {
        fontSize: "1.02rem",
        lineHeight: 1.65,
      },
      body2: {
        fontSize: "0.95rem",
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        textTransform: "none",
        letterSpacing: "0.01em",
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: "smooth",
          },
          body: {
            background: isDark
              ? "radial-gradient(circle at 0% 0%, rgba(95,174,255,0.14), transparent 35%), radial-gradient(circle at 100% 20%, rgba(56,179,154,0.14), transparent 30%), #0a1220"
              : "radial-gradient(circle at 0% 0%, rgba(15,110,207,0.08), transparent 35%), radial-gradient(circle at 100% 20%, rgba(23,134,111,0.08), transparent 30%), #f7fafc",
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: "lg",
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            minHeight: 44,
            paddingInline: 20,
            transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: isDark
                ? "0 8px 24px rgba(5, 12, 23, 0.52)"
                : "0 8px 24px rgba(18, 32, 50, 0.16)",
            },
            "&:focus-visible": {
              outline: `3px solid ${alpha(isDark ? "#5faeff" : "#0f6ecf", 0.35)}`,
              outlineOffset: 2,
            },
          },
          contained: {
            boxShadow: isDark
              ? "0 6px 18px rgba(95, 174, 255, 0.24)"
              : "0 6px 18px rgba(15, 110, 207, 0.24)",
          },
          outlined: {
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: isDark
              ? "1px solid rgba(231, 238, 248, 0.12)"
              : "1px solid rgba(18, 32, 50, 0.1)",
            boxShadow: isDark
              ? "0 16px 34px rgba(2, 8, 20, 0.52)"
              : "0 12px 30px rgba(18, 32, 50, 0.08)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(12px)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: isDark
              ? "1px solid rgba(231, 238, 248, 0.12)"
              : "1px solid rgba(18, 32, 50, 0.1)",
            boxShadow: "none",
            "&:before": {
              display: "none",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:focus-visible": {
              outline: `3px solid ${alpha(isDark ? "#5faeff" : "#0f6ecf", 0.35)}`,
              outlineOffset: 2,
            },
          },
        },
      },
    },
  });
}
