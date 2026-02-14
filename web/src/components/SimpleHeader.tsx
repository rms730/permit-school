"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Link from 'next/link';
import * as React from 'react';

import { Button } from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggleButton from './ThemeToggleButton';

export function SimpleHeader() {
  return (
    <AppBar 
      position="sticky" 
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.92),
        color: 'text.primary',
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
          <ThemeToggleButton />
          <Button
            variant="ghost"
            component={Link}
            href="/login"
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
