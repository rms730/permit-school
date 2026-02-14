"use client";

import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Collapse,
  BoxProps,
} from '@mui/material';
import * as React from 'react';

import { mergeSx } from '@/lib/mergeSx';

interface ErrorStateProps extends Omit<BoxProps, 'component'> {
  title?: string;
  message: string;
  details?: string;
  retry?: () => void;
  size?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
  component?: React.ElementType;
}

const sizeMap = {
  small: {
    iconSize: 32,
    titleVariant: 'h6' as const,
    messageVariant: 'body2' as const,
    spacing: 2,
  },
  medium: {
    iconSize: 48,
    titleVariant: 'h5' as const,
    messageVariant: 'body1' as const,
    spacing: 3,
  },
  large: {
    iconSize: 64,
    titleVariant: 'h4' as const,
    messageVariant: 'h6' as const,
    spacing: 4,
  },
};

export const ErrorState = React.forwardRef<HTMLElement, ErrorStateProps>(
  ({
    title = 'Something went wrong',
    message,
    details,
    retry,
    size = 'medium',
    align = 'center',
    component = 'div',
    sx,
    ...props
  }, ref) => {
    const sizeConfig = sizeMap[size];
    const [showDetails, setShowDetails] = React.useState(false);
    const baseSx = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      textAlign: align,
      py: sizeConfig.spacing * 2,
      px: sizeConfig.spacing,
    };
    const mergedSx = mergeSx(baseSx, sx);

    return (
      <Box
        ref={ref}
        component={component}
        sx={mergedSx}
        {...props}
      >
        <Box
          sx={{
            width: sizeConfig.iconSize,
            height: sizeConfig.iconSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'error.main',
            mb: sizeConfig.spacing,
          }}
        >
          <ErrorIcon sx={{ fontSize: sizeConfig.iconSize }} />
        </Box>

        <Typography
          variant={sizeConfig.titleVariant}
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: 'error.main',
          }}
        >
          {title}
        </Typography>

        <Typography
          variant={sizeConfig.messageVariant}
          color="text.secondary"
          sx={{
            mb: (retry || details) ? sizeConfig.spacing : 0,
            maxWidth: 400,
          }}
        >
          {message}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: 'fit-content' }}
        >
          {retry && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={retry}
              color="primary"
            >
              Try Again
            </Button>
          )}
          
          {details && (
            <Button
              variant="outlined"
              endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowDetails(!showDetails)}
              size="small"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
        </Stack>

        {details && (
          <Collapse in={showDetails} sx={{ width: '100%', mt: 2 }}>
            <Alert severity="error" sx={{ textAlign: 'left' }}>
              <Typography variant="body2" component="pre" sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                m: 0,
              }}>
                {details}
              </Typography>
            </Alert>
          </Collapse>
        )}
      </Box>
    );
  }
);

ErrorState.displayName = 'ErrorState';
