import { Button as MUIButton, ButtonProps } from '@mui/material';

export function Button(props: ButtonProps) {
  return <MUIButton size="large" {...props} />;
}
