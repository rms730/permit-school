"use client";

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  IconButton,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './Button';

const navigationItems = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Practice tests', href: '/practice' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Header() {
  const theme = useTheme();
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  // Use hooks normally - they should work in client components
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < theme.breakpoints.values.md);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [theme.breakpoints.values.md]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      // Handle anchor links
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Handle page navigation with locale
      const pathWithLocale = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
      router.push(pathWithLocale);
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        {t('brand')}
      </Typography>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} onClick={() => handleNavClick(item.href)}>
            <ListItemText 
              primary={item.label} 
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        ))}
        <ListItem sx={{ flexDirection: 'column', gap: 2, mt: 2 }}>
          <Button
            variant="ghost"
            fullWidth
            component={Link}
            href={`/${locale}/login`}
            size="lg"
          >
            Sign in
          </Button>
          <Button
            variant="primary"
            fullWidth
            component={Link}
            href={`/${locale}/practice`}
            size="lg"
            data-cta="header-start-free"
          >
            Start free
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Skip to content link */}
      <Box
        component="a"
        href="#content"
        sx={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          zIndex: 9999,
          padding: '8px',
          backgroundColor: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          '&:focus': {
            top: '6px',
          },
        }}
      >
        Skip to content
      </Box>

      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(31, 41, 55, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography
            variant="h6"
            component={Link}
            href={`/${locale}`}
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {t('brand')}
          </Typography>
          
          {!isMobile && (
            <Stack direction="row" spacing={3} alignItems="center">
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  component={item.href.startsWith('#') ? 'button' : Link}
                  href={item.href.startsWith('#') ? undefined : `/${locale}${item.href}`}
                  onClick={item.href.startsWith('#') ? () => handleNavClick(item.href) : undefined}
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  {t(item.label === 'How it works' ? 'nav.how' : item.label === 'Practice tests' ? 'nav.practice' : item.label === 'Pricing' ? 'nav.pricing' : 'nav.faq')}
                </Button>
              ))}
            </Stack>
          )}
          
          <Stack direction="row" spacing={2} alignItems="center">
            {!isMobile && (
              <>
                <Button
                  variant="ghost"
                  component={Link}
                  href={`/${locale}/login`}
                  size="md"
                >
                  {t('nav.signIn')}
                </Button>
                <Button
                  variant="primary"
                  component={Link}
                  href={`/${locale}/practice`}
                  size="md"
                  data-cta="header-start-free"
                >
                  {t('nav.start')}
                </Button>
              </>
            )}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  color: 'text.primary',
                  '&:focus-visible': {
                    outline: '3px solid #2563eb',
                    outlineOffset: '2px',
                  },
                }}
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
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
