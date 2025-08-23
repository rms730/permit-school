"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import * as React from 'react';

import { Button } from './Button';
import LanguageSwitcher from './LanguageSwitcher';

export function SimpleHeader() {
  const _theme = useTheme();

  return (
    <AppBar 
      position="sticky" 
      color="primary" 
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar 
        sx={{
          justifyContent: 'space-between',
          py: 1,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography
          variant="h6"
          component={Link}
          href="/en"
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          Permit School
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            component={Link}
            href="/signin"
            sx={{ 
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            Sign in
          </Button>
          <Button
            variant="primary"
            component={Link}
            href="/signup"
            sx={{ fontWeight: 600 }}
          >
            Sign up
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
