import { createTheme } from "@mui/material/styles";

export const modernTheme = createTheme({
  palette: {
    primary: {
      main: "#0f6ecf",
      light: "#3b8be0",
      dark: "#0a4f95",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#17866f",
      light: "#33a08a",
      dark: "#0f5f4f",
      contrastText: "#ffffff",
    },
    success: {
      main: "#1f9d66",
      light: "#35b17c",
      dark: "#137048",
    },
    warning: {
      main: "#c97f18",
      light: "#e19b3d",
      dark: "#925c11",
    },
    error: {
      main: "#c43b4a",
      light: "#d85a67",
      dark: "#932b37",
    },
    text: {
      primary: "#122032",
      secondary: "#4a5c74",
    },
    background: {
      default: "#f7fafc",
      paper: "#ffffff",
    },
    divider: "rgba(18, 32, 50, 0.16)",
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
          background:
            "radial-gradient(circle at 0% 0%, rgba(15,110,207,0.08), transparent 35%), radial-gradient(circle at 100% 20%, rgba(23,134,111,0.08), transparent 30%), #f7fafc",
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
            boxShadow: "0 8px 24px rgba(18, 32, 50, 0.16)",
          },
          "&:focus-visible": {
            outline: "3px solid rgba(15,110,207,0.35)",
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: "0 6px 18px rgba(15, 110, 207, 0.24)",
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
          border: "1px solid rgba(18, 32, 50, 0.1)",
          boxShadow: "0 12px 30px rgba(18, 32, 50, 0.08)",
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
          border: "1px solid rgba(18, 32, 50, 0.1)",
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
            outline: "3px solid rgba(15,110,207,0.35)",
            outlineOffset: 2,
          },
        },
      },
    },
  },
});
