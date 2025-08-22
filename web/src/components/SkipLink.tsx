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
        left: -10000,
        top: 'auto',
        width: 1,
        height: 1,
        overflow: 'hidden',
        zIndex: 9999,
        backgroundColor: 'primary.main',
        color: 'white',
        textDecoration: 'none',
        padding: 2,
        '&:focus': {
          left: 'auto',
          top: 0,
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
        },
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = 'auto';
        e.currentTarget.style.top = '0';
        e.currentTarget.style.width = 'auto';
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.overflow = 'visible';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-10000px';
        e.currentTarget.style.top = 'auto';
        e.currentTarget.style.width = '1px';
        e.currentTarget.style.height = '1px';
        e.currentTarget.style.overflow = 'hidden';
      }}
    >
      Skip to main content
    </Box>
  );
}
