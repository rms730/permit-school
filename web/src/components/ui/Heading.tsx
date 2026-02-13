"use client";

import { Typography, TypographyProps } from '@mui/material';
import React, { forwardRef } from 'react';

interface HeadingProps extends Omit<TypographyProps, 'component'> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  component?: React.ElementType;
}

const headingMap = {
  1: { variant: 'h1' as const, component: 'h1' as const },
  2: { variant: 'h2' as const, component: 'h2' as const },
  3: { variant: 'h3' as const, component: 'h3' as const },
  4: { variant: 'h4' as const, component: 'h4' as const },
  5: { variant: 'h5' as const, component: 'h5' as const },
  6: { variant: 'h6' as const, component: 'h6' as const },
};

export const Heading = forwardRef<HTMLElement, HeadingProps>(
  ({ level, children, component, sx, ...props }, ref) => {
    const headingConfig = headingMap[level];
    
    return (
      <Typography
        ref={ref}
        variant={headingConfig.variant}
        component={component || headingConfig.component}
        sx={{
          fontWeight: 700,
          lineHeight: 1.2,
          ...sx,
        }}
        {...props}
      >
        {children}
      </Typography>
    );
  }
);

Heading.displayName = 'Heading';
