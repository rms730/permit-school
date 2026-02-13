"use client";

import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  useTheme,
  useMediaQuery,
  IconButton,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import * as React from 'react';

import { scrollToAnchor } from '../lib/scrollToAnchor';

import { Button } from './Button';
import LanguageSwitcher from './LanguageSwitcher';

type NavItem = {
  id: 'how' | 'practice' | 'pricing' | 'faq';
  href: string;
  kind: 'anchor' | 'route';
  labelKey: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'how', href: '#how-it-works', kind: 'anchor', labelKey: 'nav.how' },
  { id: 'practice', href: '/practice', kind: 'route', labelKey: 'nav.practice' },
  { id: 'pricing', href: '#pricing', kind: 'anchor', labelKey: 'nav.pricing' },
  { id: 'faq', href: '#faq', kind: 'anchor', labelKey: 'nav.faq' },
];

export function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();

  const closeDrawer = React.useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleDrawerToggle = React.useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleNavSelect = React.useCallback(
    (item: NavItem) => {
      if (item.kind === 'anchor') {
        scrollToAnchor(item.href);
      } else {
        router.push(item.href);
      }
      closeDrawer();
    },
    [closeDrawer, router]
  );

  const drawer = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
        {t('brand')}
      </Typography>
      <List sx={{ p: 0 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.id} sx={{ px: 0, py: 0.5 }}>
            <Button
              fullWidth
              variant="ghost"
              component={item.kind === 'anchor' ? 'button' : Link}
              href={item.kind === 'route' ? item.href : undefined}
              onClick={item.kind === 'anchor' ? () => handleNavSelect(item) : undefined}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: 2,
                py: 1.25,
              }}
            >
              {t(item.labelKey)}
            </Button>
          </ListItem>
        ))}
        <ListItem sx={{ px: 0, pt: 2.5, pb: 0, flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ alignSelf: 'flex-start' }}>
            <LanguageSwitcher />
          </Box>
          <Button variant="ghost" fullWidth component={Link} href="/login" size="lg">
            {t('nav.signIn')}
          </Button>
          <Button
            variant="primary"
            fullWidth
            component={Link}
            href="/practice"
            size="lg"
            data-cta="header-start-free"
          >
            {t('nav.start')}
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(247, 250, 252, 0.88)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: 74, justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={Link}
            href={`/${locale}`}
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              textDecoration: 'none',
              fontFamily: 'var(--font-display, "Sora"), "Avenir Next", "Segoe UI", sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            {t('brand')}
          </Typography>

          {!isMobile ? (
            <Stack direction="row" spacing={1} alignItems="center" role="navigation" aria-label="Primary">
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  component={item.kind === 'anchor' ? 'button' : Link}
                  href={item.kind === 'route' ? item.href : undefined}
                  onClick={item.kind === 'anchor' ? () => handleNavSelect(item) : undefined}
                  sx={{
                    color: 'text.primary',
                    px: 1.75,
                  }}
                >
                  {t(item.labelKey)}
                </Button>
              ))}
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} alignItems="center">
            {!isMobile ? (
              <>
                <LanguageSwitcher />
                <Button variant="ghost" component={Link} href="/login" size="md">
                  {t('nav.signIn')}
                </Button>
                <Button
                  variant="primary"
                  component={Link}
                  href="/practice"
                  size="md"
                  data-cta="header-start-free"
                >
                  {t('nav.start')}
                </Button>
              </>
            ) : (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 300,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
