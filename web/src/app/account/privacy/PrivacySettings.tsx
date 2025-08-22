"use client";

import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  DataUsage as DataUsageIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Link,
 IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

interface PrivacySettingsProps {
  user: any;
  profile: any;
}

export default function PrivacySettings({ user, profile }: PrivacySettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [settings, setSettings] = useState({
    marketing_opt_in: profile?.marketing_opt_in || false,
  });

  const handleSettingChange = async (field: string, value: boolean) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Save failed');
      }

      setSettings(prev => ({ ...prev, [field]: value }));
      setMessage({ type: 'success', text: 'Settings updated successfully' });
    } catch (error) {
      console.error('Settings save error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Save failed' });
    } finally {
      setLoading(false);
    }
  };

  const privacyLinks = [
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your data',
      href: '/privacy',
      icon: <SecurityIcon />,
    },
    {
      title: 'Terms of Service',
      description: 'Our terms and conditions of use',
      href: '/terms',
      icon: <DataUsageIcon />,
    },
    {
      title: 'Data Export',
      description: 'Request a copy of your personal data',
      href: '/account/export',
      icon: <DataUsageIcon />,
    },
    {
      title: 'Account Deletion',
      description: 'Request permanent deletion of your account',
      href: '/account/delete',
      icon: <SecurityIcon />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Privacy & Security
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Communication Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="primary" />
                Communication Preferences
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.marketing_opt_in}
                    onChange={(e) => handleSettingChange('marketing_opt_in', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Receive marketing emails and updates"
                sx={{ mt: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                We&apos;ll send you updates about new courses, features, and educational content. 
                You can unsubscribe at any time.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Links */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                Privacy & Data Rights
              </Typography>
              
              <List sx={{ p: 0 }}>
                {privacyLinks.map((link, index) => (
                  <ListItem 
                    key={index}
                    component={Link}
                    href={link.href}
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
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={link.title}
                      secondary={link.description}
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DataUsageIcon color="primary" />
                Your Data
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                We store your data securely and only use it to provide our educational services. 
                Your personal information is protected by industry-standard security measures.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Data we collect:</strong> Profile information, course progress, 
                quiz results, and certificates. We do not sell your personal data to third parties.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
