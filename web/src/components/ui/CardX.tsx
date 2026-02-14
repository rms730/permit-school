"use client";

import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  CardProps,
  TypographyProps,
} from '@mui/material';
import { type Theme } from '@mui/material/styles';
import * as React from 'react';

import { mergeSx } from '@/lib/mergeSx';

interface CardXProps extends Omit<CardProps, 'title'> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  headerActions?: React.ReactNode;
  variant?: 'elevation' | 'outlined';
  titleVariant?: TypographyProps['variant'];
  subtitleVariant?: TypographyProps['variant'];
  spacing?: 'none' | 'compact' | 'normal' | 'relaxed';
}

const spacingMap = {
  none: { p: 0 },
  compact: { p: 2 },
  normal: { p: 3 },
  relaxed: { p: 4 },
};

const elevationMap = {
  elevation: 3,
  outlined: 0,
};

export const CardX = React.forwardRef<HTMLDivElement, CardXProps>(
  ({
    title,
    subtitle,
    children,
    actions,
    headerActions,
    variant = 'elevation',
    titleVariant = 'h6',
    subtitleVariant = 'body2',
    spacing = 'normal',
    sx,
    ...props
  }, ref) => {
    const baseSx = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: (theme: Theme) => theme.shadows[8],
      },
    };
    const mergedSx = mergeSx(baseSx, sx);

    return (
      <Card
        ref={ref}
        variant={variant === 'outlined' ? 'outlined' : undefined}
        elevation={elevationMap[variant]}
        sx={mergedSx}
        {...props}
      >
        {(title || headerActions) && (
          <CardHeader
            title={title && (
              <Typography variant={titleVariant} fontWeight={600}>
                {title}
              </Typography>
            )}
            subheader={subtitle && (
              <Typography variant={subtitleVariant} color="text.secondary">
                {subtitle}
              </Typography>
            )}
            action={headerActions}
            sx={{
              ...spacingMap[spacing],
              pb: 0,
            }}
          />
        )}

        <CardContent
          sx={{
            ...spacingMap[spacing],
            pt: title ? 0 : undefined,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </CardContent>

        {actions && (
          <CardActions
            sx={{
              ...spacingMap[spacing],
              pt: 0,
              justifyContent: 'flex-end',
            }}
          >
            {actions}
          </CardActions>
        )}
      </Card>
    );
  }
);

CardX.displayName = 'CardX';
