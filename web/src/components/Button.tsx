import * as React from 'react';
import { Button as MuiButton, Link as MuiLink, SxProps, Theme } from '@mui/material';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  onClick,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  ...props
}: ButtonProps) {
  const baseProps = {
    className,
    disabled,
    size,
    fullWidth,
    startIcon,
    endIcon,
    onClick,
    sx: props.sx,
    ...props,
  };

  if (href) {
    return (
      <MuiButton
        href={href}
        variant={variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text'}
        color="primary"
        aria-label={typeof children === 'string' ? children : 'link'}
        {...baseProps}
      >
        {children}
      </MuiButton>
    );
  }

  return (
    <MuiButton
      variant={variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text'}
      color="primary"
      aria-label={typeof children === 'string' ? children : 'button'}
      {...baseProps}
    >
      {children}
    </MuiButton>
  );
}
