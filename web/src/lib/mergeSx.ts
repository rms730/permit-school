import { type SxProps, type Theme } from '@mui/material/styles';
import { type SystemStyleObject } from '@mui/system';

function resolveSx(sx: SxProps<Theme>, theme: Theme): SystemStyleObject<Theme> {
  if (Array.isArray(sx)) {
    return sx.reduce<SystemStyleObject<Theme>>((acc, item) => {
      if (!item || typeof item === 'boolean') {
        return acc;
      }
      return { ...acc, ...resolveSx(item as SxProps<Theme>, theme) };
    }, {});
  }

  if (typeof sx === 'function') {
    const value = sx(theme);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as SystemStyleObject<Theme>;
  }

  return sx as SystemStyleObject<Theme>;
}

export function mergeSx(
  base: SystemStyleObject<Theme>,
  sx?: SxProps<Theme>
): SxProps<Theme> {
  if (!sx) {
    return base;
  }

  return (theme: Theme) => ({
    ...base,
    ...resolveSx(sx, theme),
  });
}
