"use client";

import { Email as EmailIcon } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { forwardRef, useState } from 'react';

import { useDialog } from '@/app/providers/DialogProvider';
import { useSnack } from '@/app/providers/SnackbarProvider';

interface ResendConsentButtonProps extends Omit<ButtonProps, 'onClick' | 'onError'> {
  childId: string;
  childName?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ResendConsentButton = forwardRef<HTMLButtonElement, ResendConsentButtonProps>(
  ({ 
    childId, 
    childName,
    onSuccess,
    onError,
    children = 'Resend Consent Email',
    disabled,
    ...props 
  }, ref) => {
    const [loading, setLoading] = useState(false);
    const { confirm } = useDialog();
    const { success, error: showError } = useSnack();

    const handleResend = async () => {
      const confirmed = await confirm({
        title: "Resend Consent Email",
        message: `Are you sure you want to resend the consent email to ${childName || 'your child'}?`,
        confirmText: "Resend Email",
        cancelText: "Cancel",
      });

      if (!confirmed) return;

      setLoading(true);

      try {
        const response = await fetch('/api/guardian/consent/resend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ childId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to resend consent email');
        }

        success('Consent email sent successfully');
        onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to resend consent email';
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
        startIcon={<EmailIcon />}
        onClick={handleResend}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Sending...' : children}
      </Button>
    );
  }
);

ResendConsentButton.displayName = 'ResendConsentButton';
