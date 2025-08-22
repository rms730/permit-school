"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import * as React from "react";

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  // Keep deterministic for now; you can extend palette/typography later.
  const theme = React.useMemo(() => createTheme({ palette: { mode: "light" } }), []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
