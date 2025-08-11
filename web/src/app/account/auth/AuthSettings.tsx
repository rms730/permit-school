"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface AuthSettingsProps {
  user: any;
  profile: any;
}

export default function AuthSettings({ user, profile }: AuthSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if Google is linked by looking at user metadata
  const isGoogleLinked = user?.app_metadata?.provider === 'google' || 
                        user?.identities?.some((identity: any) => identity.provider === 'google');

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setMessage({ type: 'error', text: 'Failed to sign out' });
    }
  };

  const handleLinkGoogle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
      await signInWithGoogle(`${baseUrl}/auth/callback`);
    } catch (error) {
      console.error('Google link error:', error);
      setMessage({ type: 'error', text: 'Failed to link Google account' });
    } finally {
      setLoading(false);
    }
  };

  const authMethods = [
    {
      provider: 'Email',
      icon: <EmailIcon />,
      status: 'Active',
      description: 'Your primary email address',
      value: user.email,
      color: 'success' as 'success',
    },
    {
      provider: 'Google',
      icon: <GoogleIcon />,
      status: isGoogleLinked ? 'Linked' : 'Not linked',
      description: isGoogleLinked ? 'Your Google account is connected' : 'Connect your Google account for easier sign-in',
      value: isGoogleLinked ? 'Connected' : 'Not connected',
      color: (isGoogleLinked ? 'success' : 'default') as 'success' | 'default',
      action: isGoogleLinked ? null : handleLinkGoogle,
      actionText: 'Link Google',
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
          Authentication
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sign-in Methods */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                Sign-in Methods
              </Typography>
              
              <List sx={{ p: 0 }}>
                {authMethods.map((method, index) => (
                  <Box key={index}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                        {method.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {method.provider}
                            <Chip 
                              label={method.status} 
                              size="small" 
                              color={method.color}
                              icon={method.status === 'Linked' || method.status === 'Active' ? <CheckCircleIcon /> : undefined}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {method.description}
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                              {method.value}
                            </Typography>
                          </Box>
                        }
                      />
                      {method.action && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={method.action}
                          disabled={loading}
                          startIcon={<LinkIcon />}
                        >
                          {method.actionText}
                        </Button>
                      )}
                    </ListItem>
                    {index < authMethods.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Security */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                Account Security
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Your account is secured with industry-standard authentication. 
                We recommend using multiple sign-in methods for better security.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleSignOut}
                  startIcon={<LogoutIcon />}
                >
                  Sign Out
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Features
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                • Two-factor authentication support through Google<br/>
                • Secure session management<br/>
                • Automatic sign-out on inactivity<br/>
                • Encrypted data transmission
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
