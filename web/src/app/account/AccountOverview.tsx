"use client";

import {
  Person as PersonIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { createAvatarSignedUrl } from '@/lib/storage/signedUrl';

interface AccountOverviewProps {
  user: any;
  profile: any;
}

export default function AccountOverview({ user, profile }: AccountOverviewProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatar_url) {
      // Create signed URL for avatar display
      createAvatarSignedUrl(profile.avatar_url)
        .then(({ url }) => setAvatarUrl(url))
        .catch(console.error);
    }
  }, [profile?.avatar_url]);

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'system': return 'System';
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      default: return 'System';
    }
  };

  const getLocaleLabel = (locale: string) => {
    switch (locale) {
      case 'en': return 'English';
      case 'es': return 'Español';
      default: return 'English';
    }
  };

  const accountItems = [
    {
      icon: <PersonIcon />,
      primary: 'Profile',
      secondary: 'Edit your name, avatar, and basic information',
      href: '/account/profile',
    },
    {
      icon: <LanguageIcon />,
      primary: 'Language & Region',
      secondary: `Current: ${getLocaleLabel(profile?.locale || 'en')}`,
      href: '/account/profile',
    },
    {
      icon: <ThemeIcon />,
      primary: 'Theme',
      secondary: `Current: ${getThemeLabel(profile?.theme_pref || 'system')}`,
      href: '/account/profile',
    },
    {
      icon: <NotificationsIcon />,
      primary: 'Notifications',
      secondary: 'Manage your notification preferences',
      href: '/notifications',
    },
    {
      icon: <SecurityIcon />,
      primary: 'Privacy & Security',
      secondary: 'Manage your privacy settings and data',
      href: '/account/privacy',
    },
    {
      icon: <SettingsIcon />,
      primary: 'Authentication',
      secondary: 'Manage your sign-in methods',
      href: '/account/auth',
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* Profile Overview Card */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar 
                src={avatarUrl || profile?.avatar_url} 
                alt={profile?.preferred_name || profile?.full_name || user.email}
                sx={{ width: 64, height: 64 }}
              />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {profile?.preferred_name || profile?.full_name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip 
                  label={profile?.role || 'student'} 
                  size="small" 
                  color="primary" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Theme
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {getThemeLabel(profile?.theme_pref || 'system')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Language
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {getLocaleLabel(profile?.locale || 'en')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Marketing Emails
              </Typography>
              <Chip 
                label={profile?.marketing_opt_in ? 'Enabled' : 'Disabled'} 
                size="small" 
                color={profile?.marketing_opt_in ? 'success' : 'default'}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Settings Navigation */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Settings
            </Typography>
            <List sx={{ p: 0 }}>
              {accountItems.map((item, index) => (
                <ListItem 
                  key={index}
                  component={Link}
                  href={item.href}
                  sx={{ 
                    px: 0, 
                    py: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.primary}
                    secondary={item.secondary}
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                  <ListItemSecondaryAction>
                    <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
