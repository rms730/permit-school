"use client";

import { 
  Warning, 
  CheckCircle, 
  Error,
  Delete,
  Security
} from "@mui/icons-material";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Alert,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useState, useEffect } from "react";

import AppBar from "@/components/AppBar";

export default function DeletionConfirmationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setError('No confirmation token provided');
      return;
    }
  }, [token]);

  const handleConfirmDeletion = async () => {
    if (!token) return;

    try {
      setConfirming(true);
      setError(null);
      
      const response = await fetch('/api/account/delete/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      if (response.ok) {
        setStatus('success');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Confirmation failed');
        setStatus('error');
      }
    } catch (err) {
      setError('Confirmation failed');
      setStatus('error');
      console.error('Deletion confirmation error:', err);
    } finally {
      setConfirming(false);
    }
  };

  if (status === 'loading') {
    return (
      <>
        <AppBar />
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" align="center">
            Account Deletion Confirmation
          </Typography>

          {status === 'invalid' && (
            <Card>
              <CardContent>
                <Stack spacing={3} alignItems="center">
                  <Error color="error" sx={{ fontSize: 64 }} />
                  <Typography variant="h6" color="error">
                    Invalid Confirmation Link
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center">
                    The confirmation link is invalid or has expired. 
                    Please request a new account deletion from your account settings.
                  </Typography>
                  <Button 
                    variant="contained" 
                    href="/account/privacy"
                  >
                    Go to Privacy Settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {status === 'error' && (
            <Card>
              <CardContent>
                <Stack spacing={3} alignItems="center">
                  <Error color="error" sx={{ fontSize: 64 }} />
                  <Typography variant="h6" color="error">
                    Confirmation Failed
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                      {error}
                    </Alert>
                  )}
                  <Typography variant="body1" color="text.secondary" align="center">
                    There was an error confirming your deletion request. 
                    Please try again or contact support.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleConfirmDeletion}
                    disabled={confirming}
                  >
                    {confirming ? <CircularProgress size={20} /> : "Try Again"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {status === 'success' && (
            <Card>
              <CardContent>
                <Stack spacing={3} alignItems="center">
                  <CheckCircle color="success" sx={{ fontSize: 64 }} />
                  <Typography variant="h6" color="success.main">
                    Deletion Confirmed
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center">
                    Your account deletion request has been confirmed. 
                    Your account will be permanently deleted after a 7-day grace period.
                  </Typography>
                  <Alert severity="info" sx={{ width: '100%' }}>
                    During the grace period, you can still access your account and cancel the deletion request.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          )}

          {status !== 'invalid' && status !== 'error' && status !== 'success' && (
            <Card>
              <CardContent>
                <Stack spacing={3} alignItems="center">
                  <Warning color="warning" sx={{ fontSize: 64 }} />
                  <Typography variant="h6">
                    Confirm Account Deletion
                  </Typography>
                  
                  <Alert severity="warning" sx={{ width: '100%' }}>
                    <Typography variant="body2" fontWeight="bold">
                      This action cannot be undone!
                    </Typography>
                    <Typography variant="body2">
                      Confirming this request will permanently delete your account and all associated data after a 7-day grace period.
                    </Typography>
                  </Alert>

                  <Stack spacing={2} sx={{ width: '100%' }}>
                    <Typography variant="h6">What will be deleted:</Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">• Your personal profile information</Typography>
                      <Typography variant="body2">• All course enrollments and progress</Typography>
                      <Typography variant="body2">• Quiz attempts and scores</Typography>
                      <Typography variant="body2">• Seat time records</Typography>
                      <Typography variant="body2">• Account settings and preferences</Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ width: '100%' }} />

                  <Stack spacing={2} sx={{ width: '100%' }}>
                    <Typography variant="h6">What will be retained:</Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">• Certificate numbers (for compliance)</Typography>
                      <Typography variant="body2">• Audit logs of the deletion process</Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="outlined" 
                      href="/account/privacy"
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleConfirmDeletion}
                      disabled={confirming}
                      fullWidth
                    >
                      {confirming ? <CircularProgress size={20} /> : "Confirm Deletion"}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
    </>
  );
}
