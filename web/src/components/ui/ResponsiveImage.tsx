"use client";

import { Box, Skeleton } from '@mui/material';
import Image from 'next/image';
import { forwardRef, useState } from 'react';

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
  sx?: any;
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsiveImage = forwardRef<HTMLDivElement, ResponsiveImageProps>(
  ({ 
    src, 
    alt, 
    width, 
    height, 
    ratio = 16/9,
    fill = false,
    priority = false,
    sizes = '100vw',
    className,
    sx,
    onLoad,
    onError,
    ...props 
  }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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
          sx={{
            width: width || '100%',
            height: height || (width ? width / ratio : 'auto'),
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            ...sx,
          }}
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
        sx={{
          position: 'relative',
          width: width || '100%',
          height: height || (width ? width / ratio : 'auto'),
          overflow: 'hidden',
          ...sx,
        }}
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
          width={width}
          height={height}
          fill={fill}
          priority={priority}
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
