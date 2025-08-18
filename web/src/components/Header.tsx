"use client";

import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <AppBar color="transparent" position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>
          Permit School
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {navItems.map((item) => (
            <Button key={item.label} href={item.href} variant="text">
              {item.label}
            </Button>
          ))}
        </Stack>
        
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button href="/login" color="inherit" size="large" variant="text">
            Login
          </Button>
          <Button 
            href="/practice" 
            variant="contained" 
            size="large" 
            data-testid="cta-header-get-started"
          >
            Get started
          </Button>
          <IconButton 
            sx={{ display: { xs: 'inline-flex', md: 'none' } }} 
            aria-label="Open menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      </Toolbar>
      
      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {navItems.map((item) => (
          <MenuItem key={item.label} component="a" href={item.href} onClick={handleMenuClose}>
            {item.label}
          </MenuItem>
        ))}
        <MenuItem component="a" href="/login" onClick={handleMenuClose}>
          Login
        </MenuItem>
        <MenuItem component="a" href="/practice" onClick={handleMenuClose}>
          Get started
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
