"use client";

import { CheckCircle as CheckIcon } from '@mui/icons-material';
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

interface SuccessBannerProps {
  title?: string;
  message?: string;
  showManageButton?: boolean;
  showDashboardButton?: boolean;
}

export const SuccessBanner = forwardRef<HTMLDivElement, SuccessBannerProps>(
  ({ 
    title = 'Payment Successful!',
    message = 'Your subscription has been activated successfully.',
    showManageButton = true,
    showDashboardButton = true,
  }, ref) => {
    return (
      <Box ref={ref} sx={{ mb: 4 }}>
        <Alert 
          severity="success" 
          icon={<CheckIcon />}
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
            {showManageButton && (
              <Button
                component={Link}
                href="/account/billing"
                variant="contained"
                color="primary"
                size="small"
              >
                Manage Subscription
              </Button>
            )}
            
            {showDashboardButton && (
              <Button
                component={Link}
                href="/dashboard"
                variant="outlined"
                color="primary"
                size="small"
              >
                Go to Dashboard
              </Button>
            )}
          </Stack>
        </Alert>
      </Box>
    );
  }
);

SuccessBanner.displayName = 'SuccessBanner';
