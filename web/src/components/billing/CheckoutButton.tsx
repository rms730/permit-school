"use client";

import { Button, ButtonProps } from '@mui/material';
import { forwardRef, useState } from 'react';

import { useSnack } from '@/app/providers/SnackbarProvider';

interface CheckoutButtonProps extends Omit<ButtonProps, 'onClick' | 'onError'> {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CheckoutButton = forwardRef<HTMLButtonElement, CheckoutButtonProps>(
  ({ 
    priceId, 
    successUrl = '/billing/success',
    cancelUrl = '/billing/cancel',
    onSuccess,
    onError,
    children = 'Subscribe Now',
    disabled,
    ...props 
  }, ref) => {
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useSnack();

    const handleCheckout = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            successUrl,
            cancelUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received');
        }

        success('Redirecting to checkout...');
        onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
        showError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Button
        ref={ref}
        variant="contained"
        color="primary"
        onClick={handleCheckout}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </Button>
    );
  }
);

CheckoutButton.displayName = 'CheckoutButton';
