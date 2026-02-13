"use client";

import { Chip, ChipProps } from '@mui/material';
import React, { forwardRef } from 'react';

type StatusType = 
  | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  | 'paid' | 'unpaid' | 'draft' | 'issued' | 'void'
  | 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium';
}

const statusMap: Record<StatusType, { color: ChipProps['color']; label: string }> = {
  // Generic statuses
  success: { color: 'success', label: 'Success' },
  warning: { color: 'warning', label: 'Warning' },
  error: { color: 'error', label: 'Error' },
  info: { color: 'info', label: 'Info' },
  neutral: { color: 'default', label: 'Neutral' },
  
  // Payment statuses
  paid: { color: 'success', label: 'Paid' },
  unpaid: { color: 'warning', label: 'Unpaid' },
  
  // Certificate statuses
  draft: { color: 'default', label: 'Draft' },
  issued: { color: 'success', label: 'Issued' },
  void: { color: 'error', label: 'Void' },
  
  // General statuses
  active: { color: 'success', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
  pending: { color: 'warning', label: 'Pending' },
  completed: { color: 'success', label: 'Completed' },
  cancelled: { color: 'error', label: 'Cancelled' },
};

export const StatusChip = forwardRef<HTMLDivElement, StatusChipProps>(
  ({ status, label, size = 'small', ...props }, ref) => {
    const statusConfig = statusMap[status];
    
    return (
      <Chip
        ref={ref}
        size={size}
        color={statusConfig.color}
        label={label || statusConfig.label}
        sx={{
          fontWeight: 500,
          textTransform: 'capitalize',
          ...props.sx,
        }}
        {...props}
      />
    );
  }
);

StatusChip.displayName = 'StatusChip';
