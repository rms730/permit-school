"use client";

import { Button, ButtonProps } from '@mui/material';
import { forwardRef, useState } from 'react';

import { useSnack } from '@/app/providers/SnackbarProvider';

interface ManageSubscriptionButtonProps extends Omit<ButtonProps, 'onClick' | 'onError'> {
  returnUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ManageSubscriptionButton = forwardRef<HTMLButtonElement, ManageSubscriptionButtonProps>(
  ({ 
    returnUrl = '/account/billing',
    onSuccess,
    onError,
    children = 'Manage Subscription',
    disabled,
    ...props 
  }, ref) => {
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useSnack();

    const handleManageSubscription = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/billing/portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create portal session');
        }

        // Redirect to Stripe Customer Portal
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No portal URL received');
        }

        success('Redirecting to billing portal...');
        onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to open billing portal';
        showError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Button
        ref={ref}
        variant="outlined"
        color="primary"
        onClick={handleManageSubscription}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </Button>
    );
  }
);

ManageSubscriptionButton.displayName = 'ManageSubscriptionButton';
