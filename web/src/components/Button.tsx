import { Button as MUIButton, ButtonProps as MUIButtonProps, CircularProgress } from '@mui/material';
import * as React from 'react';

export interface ButtonProps extends Omit<MUIButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  asChild?: boolean;
  'data-testid'?: string;
  'data-cta'?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'start',
  fullWidth = false,
  asChild = false,
  disabled,
  sx,
  ...props
}: ButtonProps) {
  const muiVariant = variant === 'primary' ? 'contained' : 
                    variant === 'secondary' ? 'outlined' : 
                    variant === 'ghost' ? 'text' : 'text';
  
  const muiSize = size === 'sm' ? 'small' : 
                  size === 'lg' ? 'large' : 'medium';

  const isDisabled = disabled || loading;

  const startIcon = loading ? <CircularProgress size={16} color="inherit" /> : 
                   icon && iconPosition === 'start' ? icon : undefined;
  
  const endIcon = icon && iconPosition === 'end' ? icon : undefined;

  // Custom styles for ghost and link variants
  const customSx = {
    ...sx,
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
      color: 'primary.main',
      '&:hover': {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
      },
    }),
    ...(variant === 'link' && {
      backgroundColor: 'transparent',
      color: 'primary.main',
      textDecoration: 'underline',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'none',
        boxShadow: 'none',
        transform: 'none',
      },
    }),
  };

  return (
    <MUIButton
      variant={muiVariant}
      size={muiSize}
      disabled={isDisabled}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={customSx}
      {...props}
    >
      {children}
    </MUIButton>
  );
}
