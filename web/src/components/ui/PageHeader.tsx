"use client";

import { 
  Box, 
  Typography, 
  Stack, 
  BoxProps
} from '@mui/material';
import { forwardRef } from 'react';

interface PageHeaderProps extends Omit<BoxProps, 'component'> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  component?: React.ElementType;
  align?: 'left' | 'center' | 'right';
}

const headingVariants = {
  1: 'h1',
  2: 'h2', 
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  ({ 
    title, 
    subtitle, 
    actions, 
    level = 1,
    component = 'header',
    align = 'left',
    sx,
    ...props 
  }, ref) => {
    return (
      <Box
        ref={ref}
        component={component}
        sx={{
          mb: { xs: 3, md: 4 },
          textAlign: align,
          ...sx,
        }}
        {...props}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={{ xs: 2, md: 3 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant={headingVariants[level]}
              component={headingVariants[level]}
              sx={{
                fontWeight: 700,
                mb: subtitle ? 1 : 0,
                fontSize: {
                  xs: level === 1 ? '2rem' : level === 2 ? '1.75rem' : '1.5rem',
                  md: level === 1 ? '2.5rem' : level === 2 ? '2rem' : '1.75rem',
                },
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              flexShrink: 0 
            }}>
              {actions}
            </Box>
          )}
        </Stack>
      </Box>
    );
  }
);

PageHeader.displayName = 'PageHeader';
