"use client";

import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import * as React from "react";

import { modernTheme } from "@/theme/modernTheme";

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            colorScheme: "light",
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
  );
}
