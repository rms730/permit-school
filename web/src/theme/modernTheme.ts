import { createTheme } from "@mui/material/styles";

// Modern theme for teen-friendly UX
export const modernTheme = createTheme({
  palette: {
    primary: {
      main: "#00BCD4", // Teal/Cyan - energetic yet professional
      light: "#4DD0E1",
      dark: "#0097A7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7C4DFF", // Violet - modern and engaging
      light: "#B388FF",
      dark: "#512DA8",
      contrastText: "#ffffff",
    },
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
    warning: {
      main: "#FF9800",
      light: "#FFB74D",
      dark: "#F57C00",
    },
    error: {
      main: "#F44336",
      light: "#E57373",
      dark: "#D32F2F",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#666666",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
    divider: "#E0E0E0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners for modern feel
  },
  spacing: 8, // Base spacing unit
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
          minHeight: 44, // Touch-friendly target size
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:focus-visible': {
            outline: '3px solid #00BCD4',
            outlineOffset: '2px',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0097A7 0%, #00BCD4 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #F0F0F0',
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
              borderColor: '#00BCD4',
              borderWidth: '2px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4DD0E1',
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
            background: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
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
            outline: '3px solid #00BCD4',
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
            outline: '3px solid #00BCD4',
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
  },
});
