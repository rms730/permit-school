"use client";

import { Chip } from '@mui/material';

import { getOfflineBadgeText } from '@/lib/offline';

interface OfflineModeBadgeProps {
  size?: 'small' | 'medium';
  color?: 'warning' | 'error' | 'info';
}

export default function OfflineModeBadge({ 
  size = 'small', 
  color = 'warning' 
}: OfflineModeBadgeProps) {
  const badgeText = getOfflineBadgeText();
  
  if (!badgeText) {
    return null;
  }

  return (
    <Chip
      label={badgeText}
      size={size}
      color={color}
      sx={{ 
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        height: size === 'small' ? 20 : 24,
        '& .MuiChip-label': { px: 1 }
      }}
    />
  );
}
