"use client";

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  School,
  Receipt,
  ExitToApp,
  Notifications,
  Language,
  Close,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface AppBarV2Props {
  user?: any;
  onSignOut?: () => void;
}

export default function AppBarV2({ user, onSignOut }: AppBarV2Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignInWithGoogle = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
      await signInWithGoogle(`${baseUrl}/auth/callback`);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut?.();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuId = 'primary-search-account-menu';
  const isMenuOpen = Boolean(anchorEl);

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { router.push('/dashboard'); handleMenuClose(); }}>
        <ListItemIcon>
          <Dashboard fontSize="small" />
        </ListItemIcon>
        Dashboard
      </MenuItem>
      <MenuItem onClick={() => { router.push('/courses'); handleMenuClose(); }}>
        <ListItemIcon>
          <School fontSize="small" />
        </ListItemIcon>
        My Courses
      </MenuItem>
      <MenuItem onClick={() => { router.push('/billing'); handleMenuClose(); }}>
        <ListItemIcon>
          <Receipt fontSize="small" />
        </ListItemIcon>
        Billing
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleSignOut}>
        <ListItemIcon>
          <ExitToApp fontSize="small" />
        </ListItemIcon>
        Sign Out
      </MenuItem>
    </Menu>
  );

  const renderMobileDrawer = (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleMobileDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: 280,
          borderRadius: '0 16px 16px 0',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>
          Menu
        </Typography>
        <IconButton onClick={handleMobileDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {user ? (
          <>
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Avatar 
                  src={user.avatar_url} 
                  alt={user.full_name || user.email}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user.preferred_name || user.full_name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
            <Divider />
            <ListItem button onClick={() => { router.push('/dashboard'); handleMobileDrawerToggle(); }}>
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => { router.push('/courses'); handleMobileDrawerToggle(); }}>
              <ListItemIcon>
                <School />
              </ListItemIcon>
              <ListItemText primary="My Courses" />
            </ListItem>
            <ListItem button onClick={() => { router.push('/billing'); handleMobileDrawerToggle(); }}>
              <ListItemIcon>
                <Receipt />
              </ListItemIcon>
              <ListItemText primary="Billing" />
            </ListItem>
            <Divider />
            <ListItem button onClick={handleSignOut}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </>
        ) : (
          <ListItem>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSignInWithGoogle}
              sx={{ py: 1.5 }}
            >
              Continue with Google
            </Button>
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00BCD4 0%, #7C4DFF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/')}
            >
              Permit School
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user ? (
                <>
                  <Chip
                    label="Continue Learning"
                    color="primary"
                    onClick={() => router.push('/dashboard')}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  />
                  
                  <IconButton
                    size="large"
                    aria-label="notifications"
                    color="inherit"
                    onClick={(e) => setNotificationsAnchor(e.currentTarget)}
                  >
                    <Notifications />
                  </IconButton>

                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <Avatar 
                      src={user.avatar_url} 
                      alt={user.full_name || user.email}
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => router.push('/signin')}
                    sx={{ fontWeight: 600 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSignInWithGoogle}
                    sx={{ fontWeight: 600 }}
                  >
                    Continue with Google
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Sign In Button */}
          {isMobile && !user && (
            <Button
              variant="contained"
              size="small"
              onClick={handleSignInWithGoogle}
              sx={{ fontWeight: 600 }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {renderMenu}
      {renderMobileDrawer}
    </>
  );
}
