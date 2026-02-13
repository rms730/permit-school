"use client";

import { forwardRef } from 'react';

import { StatusChip } from '@/components/ui/StatusChip';

type PaymentStatus = 'paid' | 'unpaid' | 'pending' | 'failed' | 'refunded' | 'cancelled';

interface PaymentStatusChipProps {
  status: PaymentStatus;
  label?: string;
}

export const PaymentStatusChip = forwardRef<HTMLDivElement, PaymentStatusChipProps>(
  ({ status, label }, ref) => {
    // Map payment statuses to StatusChip statuses
    const statusMap: Record<PaymentStatus, 'success' | 'warning' | 'error' | 'info'> = {
      paid: 'success',
      unpaid: 'warning',
      pending: 'warning',
      failed: 'error',
      refunded: 'info',
      cancelled: 'error',
    };

    const defaultLabels: Record<PaymentStatus, string> = {
      paid: 'Paid',
      unpaid: 'Unpaid',
      pending: 'Pending',
      failed: 'Failed',
      refunded: 'Refunded',
      cancelled: 'Cancelled',
    };

    return (
      <StatusChip
        ref={ref}
        status={statusMap[status]}
        label={label || defaultLabels[status]}
      />
    );
  }
);

PaymentStatusChip.displayName = 'PaymentStatusChip';
