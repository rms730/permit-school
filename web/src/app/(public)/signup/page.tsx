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

export default function SignupPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const router = useRouter();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = React.useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
      await signInWithGoogle(`${baseUrl}/auth/callback`);
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        // Show success message and redirect to login
        setError(null);
        router.push('/login?message=Please check your email to confirm your account.');
      }
    } catch (error) {
      console.error('Email sign-up error:', error);
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
                  Join Permit School!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Start your learning journey today
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {!showEmailForm ? (
                <Stack spacing={3}>
                  {/* Google Sign-Up Button */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleGoogleSignUp}
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

                  {/* Email Sign-Up Option */}
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
                    Sign up with Email
                  </Button>
                </Stack>
              ) : (
                <Box component="form" onSubmit={handleEmailSignUp}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                      helperText="Must be at least 6 characters"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {loading ? 'Creating Account...' : 'Create Account'}
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
                  Already have an account?{' '}
                  <Button
                    variant="text"
                    onClick={() => router.push('/login')}
                    sx={{ fontWeight: 600, p: 0, minWidth: 'auto' }}
                  >
                    Sign in
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
