"use client";

import { Box } from "@mui/material";
import * as React from "react";

export function SkipLink() {
  return (
    <Box
      component="a"
      href="#main"
      sx={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 9999,
        backgroundColor: 'primary.main',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 600,
        '&:focus': {
          left: '16px',
          top: '16px',
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
        },
      }}
    >
      Skip to main content
    </Box>
  );
}
