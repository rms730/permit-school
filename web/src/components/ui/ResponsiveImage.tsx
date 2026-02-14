"use client";

import { Box, Skeleton } from '@mui/material';
import { type SxProps, type Theme } from '@mui/material/styles';
import Image from 'next/image';
import * as React from 'react';

import { mergeSx } from '@/lib/mergeSx';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  ratio?: number; // width/height ratio
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  sx?: SxProps<Theme>;
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsiveImage = React.forwardRef<HTMLDivElement, ResponsiveImageProps>(
  ({
    src,
    alt,
    width,
    height,
    ratio = 16 / 9,
    fill = false,
    priority = false,
    sizes = '100vw',
    className,
    sx,
    onLoad,
    onError,
    ...props
  }, ref) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const resolvedWidth =
      typeof width === 'number'
        ? width
        : typeof height === 'number'
          ? Math.round(height * ratio)
          : undefined;
    const resolvedHeight =
      typeof height === 'number'
        ? height
        : typeof width === 'number'
          ? Math.round(width / ratio)
          : undefined;
    const useFill = fill || (!resolvedWidth && !resolvedHeight);
    const containerSizingSx = useFill
      ? {
          width: '100%',
          aspectRatio: `${ratio}`,
        }
      : {
          width: resolvedWidth ?? '100%',
          height: resolvedHeight ?? 'auto',
        };
    const errorSx = mergeSx(
      {
        ...containerSizingSx,
        backgroundColor: 'grey.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
      },
      sx
    );
    const frameSx = mergeSx(
      {
        ...containerSizingSx,
        position: 'relative',
        overflow: 'hidden',
      },
      sx
    );

    const handleLoad = () => {
      setLoading(false);
      onLoad?.();
    };

    const handleError = () => {
      setLoading(false);
      setError(true);
      onError?.();
    };

    if (error) {
      return (
        <Box
          ref={ref}
          sx={errorSx}
          {...props}
        >
          <Box component="span" sx={{ fontSize: '0.875rem' }}>
            Image failed to load
          </Box>
        </Box>
      );
    }

    return (
      <Box
        ref={ref}
        sx={frameSx}
        className={className}
        {...props}
      >
        {loading && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        
        <Image
          src={src}
          alt={alt}
          {...(useFill
            ? { fill: true as const }
            : { width: resolvedWidth, height: resolvedHeight })}
          priority={priority || undefined}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      </Box>
    );
  }
);

ResponsiveImage.displayName = 'ResponsiveImage';
