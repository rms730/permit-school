"use client";

import { 
  Skeleton, 
  Box, 
  Stack, 
  Card, 
  CardContent
} from '@mui/material';
import { forwardRef } from 'react';

interface SkeletonXProps {
  variant?: 'text' | 'card' | 'list' | 'hero' | 'table';
  lines?: number;
  height?: number | string;
  width?: number | string;
  spacing?: number;
  sx?: any;
}

export const SkeletonX = forwardRef<HTMLDivElement, SkeletonXProps>(
  ({ 
    variant = 'text', 
    lines = 3, 
    height, 
    width, 
    spacing = 1,
    sx,
    ...props 
  }, ref) => {
    const renderSkeleton = () => {
      switch (variant) {
        case 'card':
          return (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={spacing}>
                  <Skeleton variant="rectangular" height={24} width="60%" />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="80%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </Stack>
              </CardContent>
            </Card>
          );

        case 'list':
          return (
            <Stack spacing={spacing}>
              {Array.from({ length: lines }).map((_, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" height={20} width="70%" />
                    <Skeleton variant="text" height={16} width="50%" />
                  </Box>
                  <Skeleton variant="rectangular" width={80} height={32} />
                </Box>
              ))}
            </Stack>
          );

        case 'hero':
          return (
            <Box>
              <Skeleton variant="rectangular" height={48} width="80%" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} width="60%" sx={{ mb: 3 }} />
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rectangular" width={120} height={48} />
                <Skeleton variant="rectangular" width={120} height={48} />
              </Stack>
            </Box>
          );

        case 'table':
          return (
            <Stack spacing={1}>
              {Array.from({ length: lines }).map((_, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="text" width="30%" height={20} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="20%" height={20} />
                  <Skeleton variant="text" width="10%" height={20} />
                </Box>
              ))}
            </Stack>
          );

        default:
          return (
            <Stack spacing={spacing}>
              {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="text"
                  height={height || 20}
                  width={index === lines - 1 ? '60%' : width || '100%'}
                  {...props}
                />
              ))}
            </Stack>
          );
      }
    };

    return (
      <Box ref={ref} sx={sx}>
        {renderSkeleton()}
      </Box>
    );
  }
);

SkeletonX.displayName = 'SkeletonX';
