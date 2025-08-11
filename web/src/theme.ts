import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { 
      main: "#1976d2",
      contrastText: "#ffffff"
    },
    secondary: { 
      main: "#9c27b0",
      contrastText: "#ffffff"
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#666666"
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff"
    }
  },
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
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
            borderRadius: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
  },
});

export default theme;
