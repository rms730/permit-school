"use client";

import { Box, BoxProps, Container } from '@mui/material';
import * as React from 'react';

import { mergeSx } from '@/lib/mergeSx';

interface SectionProps extends Omit<BoxProps, 'component'> {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  component?: React.ElementType;
}

const spacingMap = {
  xs: { py: 2 },
  sm: { py: 4 },
  md: { py: 6 },
  lg: { py: 8 },
  xl: { py: 12 },
};

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({
    children,
    maxWidth = 'lg',
    spacing = 'md',
    component = 'section',
    sx,
    ...props
  }, ref) => {
    const mergedSx = mergeSx(spacingMap[spacing], sx);

    return (
      <Box
        ref={ref}
        component={component}
        sx={mergedSx}
        {...props}
      >
        <Container maxWidth={maxWidth} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Container>
      </Box>
    );
  }
);

Section.displayName = 'Section';
