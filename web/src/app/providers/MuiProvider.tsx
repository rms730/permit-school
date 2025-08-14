"use client";

import * as React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

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
