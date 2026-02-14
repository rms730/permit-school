"use client";

import { Typography, TypographyProps } from '@mui/material';
import * as React from 'react';

import { mergeSx } from '@/lib/mergeSx';

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

export const Heading = React.forwardRef<HTMLElement, HeadingProps>(
  ({ level, children, component, sx, ...props }, ref) => {
    const headingConfig = headingMap[level];
    const baseSx = {
      fontWeight: 700,
      lineHeight: 1.2,
    };
    const mergedSx = mergeSx(baseSx, sx);

    return (
      <Typography
        ref={ref}
        variant={headingConfig.variant}
        component={component || headingConfig.component}
        sx={mergedSx}
        {...props}
      >
        {children}
      </Typography>
    );
  }
);

Heading.displayName = 'Heading';
