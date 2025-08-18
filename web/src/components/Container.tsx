import { Container as MuiContainer, ContainerProps } from '@mui/material';

export function Container({ children, maxWidth = 'lg', ...props }: ContainerProps) {
  return (
    <MuiContainer maxWidth={maxWidth} {...props}>
      {children}
    </MuiContainer>
  );
}
