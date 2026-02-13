"use client";

import { Info as InfoIcon } from '@mui/icons-material';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Typography, 
  Button, 
  Stack 
} from '@mui/material';
import Link from 'next/link';
import { forwardRef } from 'react';

interface CancelBannerProps {
  title?: string;
  message?: string;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
}

export const CancelBanner = forwardRef<HTMLDivElement, CancelBannerProps>(
  ({ 
    title = 'Payment Cancelled',
    message = 'Your payment was cancelled. No charges were made to your account.',
    showRetryButton = true,
    showHomeButton = true,
  }, ref) => {
    return (
      <Box ref={ref} sx={{ mb: 4 }}>
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ 
            p: 3,
            '& .MuiAlert-message': {
              width: '100%',
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </AlertTitle>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {message}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {showRetryButton && (
              <Button
                component={Link}
                href="/pricing"
                variant="contained"
                color="primary"
                size="small"
              >
                Try Again
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                component={Link}
                href="/"
                variant="outlined"
                color="primary"
                size="small"
              >
                Go Home
              </Button>
            )}
          </Stack>
        </Alert>
      </Box>
    );
  }
);

CancelBanner.displayName = 'CancelBanner';
