"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthClient } from '@/lib/auth';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createAuthClient();
        
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Authentication failed. Please try again.');
          return;
        }

        if (session?.user) {
          // Extract user data from Google OAuth
          const user = session.user;
          const userMetadata = user.user_metadata;
          
          // Prepare profile data for upsert
          const profileData = {
            id: user.id,
            full_name: userMetadata?.full_name,
            avatar_url: userMetadata?.avatar_url,
            preferred_name: userMetadata?.name,
            locale: userMetadata?.locale,
          };

          // Upsert profile (this will handle the logic of not overwriting existing data)
          try {
            await fetch('/api/auth/profile/upsert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(profileData),
            });
          } catch (profileError) {
            console.error('Profile upsert error:', profileError);
            // Don't fail the auth flow if profile upsert fails
          }

          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          setError('No session found. Please try signing in again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to sign in...
        </Typography>
        {setTimeout(() => router.push('/signin'), 3000)}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        Completing sign in...
      </Typography>
    </Box>
  );
}
