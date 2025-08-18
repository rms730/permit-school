import { createTheme } from "@mui/material/styles";

// High-converting marketing theme with improved design system
export const modernTheme = createTheme({
  palette: {
    primary: {
      main: "#2563eb", // Brand blue
      light: "#3b82f6",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#22c55e", // Success green
      light: "#4ade80",
      dark: "#16a34a",
      contrastText: "#ffffff",
    },
    success: {
      main: "#22c55e",
      light: "#4ade80",
      dark: "#16a34a",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    text: {
      primary: "#0f172a", // Dark ink
      secondary: "#475569", // Muted text
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    divider: "#1f2937", // Border color
  },
  typography: {
    fontFamily: '"Inter", "Manrope", "Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Inter", "Manrope", "Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 800,
      fontSize: '3.5rem', // 56px
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      '@media (max-width:900px)': {
        fontSize: '2.75rem', // 44px
      },
    },
    h2: {
      fontFamily: '"Inter", "Manrope", "Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem', // 40px
      lineHeight: 1.15,
      letterSpacing: '-0.01em',
      '@media (max-width:900px)': {
        fontSize: '2rem', // 32px
      },
    },
    h3: {
      fontFamily: '"Inter", "Manrope", "Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem', // 28px
      lineHeight: 1.2,
      '@media (max-width:900px)': {
        fontSize: '1.5rem', // 24px
      },
    },
    h4: {
      fontFamily: '"Inter", "Manrope", "Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: '"Inter", "Manrope", "Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Inter", "Manrope", "Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.125rem', // 18px
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '1rem', // 16px
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          minHeight: 44,
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:focus-visible': {
            outline: '3px solid #2563eb',
            outlineOffset: '2px',
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #22d3ee 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 50%, #06b6d4 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        sizeSmall: {
          padding: '8px 16px',
          minHeight: 36,
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '16px 32px',
          minHeight: 52,
          fontSize: '1.125rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #1f2937',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563eb',
              borderWidth: '2px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #22d3ee 100%)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
          '&:focus-visible': {
            outline: '3px solid #2563eb',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minWidth: 44,
          minHeight: 44,
          '&:focus-visible': {
            outline: '3px solid #2563eb',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:before': {
            display: 'none',
          },
        },
      },
    },
  },
});
