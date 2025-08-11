"use client";

import * as React from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as LearnIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import AppBarV2 from '@/components/AppBarV2';

interface AppShellProps {
  children: React.ReactNode;
  user?: any;
  onSignOut?: () => void;
}

export default function AppShell({ children, user, onSignOut }: AppShellProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 0;
    if (pathname.startsWith('/courses') || pathname.startsWith('/learn')) return 1;
    if (pathname === '/notifications') return 2;
    if (pathname.startsWith('/account')) return 3;
    return 0; // Default to home
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        router.push('/dashboard');
        break;
      case 1:
        router.push('/courses');
        break;
      case 2:
        router.push('/notifications');
        break;
      case 3:
        router.push('/account');
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBarV2 user={user} onSignOut={onSignOut} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: isMobile ? 7 : 0, // Add bottom padding on mobile for BottomNavigation
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderRadius: '16px 16px 0 0',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          elevation={8}
        >
          <BottomNavigation
            value={getActiveTab()}
            onChange={handleTabChange}
            sx={{
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '6px 12px 8px',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 500,
              },
            }}
          >
            <BottomNavigationAction
              label="Home"
              icon={<HomeIcon />}
              sx={{
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                },
              }}
            />
            <BottomNavigationAction
              label="Learn"
              icon={<LearnIcon />}
              sx={{
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                },
              }}
            />
            <BottomNavigationAction
              label="Notifications"
              icon={<NotificationsIcon />}
              sx={{
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                },
              }}
            />
            <BottomNavigationAction
              label="Profile"
              icon={<ProfileIcon />}
              sx={{
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                },
              }}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
