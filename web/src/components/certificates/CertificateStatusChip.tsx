"use client";

import { forwardRef } from 'react';

import { StatusChip } from '@/components/ui/StatusChip';

type CertificateStatus = 'draft' | 'issued' | 'void';

interface CertificateStatusChipProps {
  status: CertificateStatus;
  label?: string;
}

export const CertificateStatusChip = forwardRef<HTMLDivElement, CertificateStatusChipProps>(
  ({ status, label }, ref) => {
    const defaultLabels: Record<CertificateStatus, string> = {
      draft: 'Draft',
      issued: 'Issued',
      void: 'Void',
    };

    return (
      <StatusChip
        ref={ref}
        status={status}
        label={label || defaultLabels[status]}
      />
    );
  }
);

CertificateStatusChip.displayName = 'CertificateStatusChip';
