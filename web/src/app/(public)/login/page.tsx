"use client";

import * as React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Email as EmailIcon,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import AppBarV2 from '@/components/AppBarV2';

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
      await signInWithGoogle(`${baseUrl}/auth/callback`);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Email sign-in error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBarV2 />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '70vh',
            justifyContent: 'center',
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #00BCD4 0%, #7C4DFF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Welcome Back!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue your learning journey
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {!showEmailForm ? (
                <Stack spacing={3}>
                  {/* Google Sign-In Button */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    startIcon={<GoogleIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3367D6 0%, #2E7D32 100%)',
                      },
                    }}
                  >
                    Continue with Google
                  </Button>

                  <Divider>
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                  </Divider>

                  {/* Email Sign-In Option */}
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => setShowEmailForm(true)}
                    startIcon={<EmailIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    Sign in with Email
                  </Button>
                </Stack>
              ) : (
                <Box component="form" onSubmit={handleEmailSignIn}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      endIcon={<ArrowForward />}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>

                    <Button
                      variant="text"
                      onClick={() => setShowEmailForm(false)}
                      sx={{ fontWeight: 600 }}
                    >
                      ← Back to options
                    </Button>
                  </Stack>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Button
                    variant="text"
                    onClick={() => router.push('/signup')}
                    sx={{ fontWeight: 600, p: 0, minWidth: 'auto' }}
                  >
                    Sign up
                  </Button>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
}
