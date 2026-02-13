"use client";

import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  BoxProps
} from '@mui/material';
import React, { forwardRef } from 'react';

interface EmptyStateProps extends Omit<BoxProps, 'component'> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  size?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
  component?: React.ElementType;
}

const sizeMap = {
  small: {
    iconSize: 48,
    titleVariant: 'h6' as const,
    descriptionVariant: 'body2' as const,
    spacing: 2,
  },
  medium: {
    iconSize: 64,
    titleVariant: 'h5' as const,
    descriptionVariant: 'body1' as const,
    spacing: 3,
  },
  large: {
    iconSize: 96,
    titleVariant: 'h4' as const,
    descriptionVariant: 'h6' as const,
    spacing: 4,
  },
};

export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(
  ({ 
    icon, 
    title, 
    description, 
    primaryAction, 
    secondaryAction,
    size = 'medium',
    align = 'center',
    component = 'div',
    sx,
    ...props 
  }, ref) => {
    const sizeConfig = sizeMap[size];

    return (
      <Box
        ref={ref}
        component={component}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          textAlign: align,
          py: sizeConfig.spacing * 2,
          px: sizeConfig.spacing,
          ...sx,
        }}
        {...props}
      >
        {icon && (
          <Box
            sx={{
              width: sizeConfig.iconSize,
              height: sizeConfig.iconSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              mb: sizeConfig.spacing,
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant={sizeConfig.titleVariant}
          component="h3"
          sx={{
            fontWeight: 600,
            mb: description ? 1 : sizeConfig.spacing,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant={sizeConfig.descriptionVariant}
            color="text.secondary"
            sx={{
              mb: (primaryAction || secondaryAction) ? sizeConfig.spacing : 0,
              maxWidth: 400,
            }}
          >
            {description}
          </Typography>
        )}

        {(primaryAction || secondaryAction) && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: 'fit-content' }}
          >
            {primaryAction && (
              <Button
                variant="contained"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                loading={primaryAction.loading}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outlined"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
              >
                {secondaryAction.label}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    );
  }
);

EmptyState.displayName = 'EmptyState';
