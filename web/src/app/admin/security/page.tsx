"use client";

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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  Chip,
  Divider,
} from "@mui/material";
import Grid from '@mui/material/GridLegacy';
import * as React from "react";
import { useState, useEffect } from "react";

import AppBar from "@/components/AppBar";

interface MFASetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

interface SecurityStatus {
  mfa_enabled: boolean;
  last_auth_at: string;
  session_age_minutes: number;
}

export default function AdminSecurityPage() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [mfaSetup, setMfaSetup] = useState<MFASetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCode, setBackupCode] = useState("");

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/security/status');
      if (response.ok) {
        const data = await response.json();
        setSecurityStatus(data);
      } else {
        setError('Failed to load security status');
      }
    } catch (err) {
      setError('Failed to load security status');
      console.error('Security status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    try {
      setSetupLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/security/mfa/setup', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMfaSetup(data);
        setShowSetupDialog(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to setup MFA');
      }
    } catch (err) {
      setError('Failed to setup MFA');
      console.error('MFA setup error:', err);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode.trim() && !backupCode.trim()) {
      setError('Please enter a verification code or backup code');
      return;
    }

    try {
      setVerifyLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/security/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: verificationCode.trim() || backupCode.trim(),
          is_backup_code: !!backupCode.trim()
        })
      });
      
      if (response.ok) {
        setSuccess('MFA setup completed successfully!');
        setShowSetupDialog(false);
        setShowVerifyDialog(false);
        setVerificationCode("");
        setBackupCode("");
        setMfaSetup(null);
        fetchSecurityStatus(); // Refresh status
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed');
      console.error('MFA verification error:', err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!window.confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/security/mfa/disable', {
        method: 'POST'
      });
      
      if (response.ok) {
        setSuccess('MFA disabled successfully');
        fetchSecurityStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to disable MFA');
      }
    } catch (err) {
      setError('Failed to disable MFA');
      console.error('MFA disable error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReauth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/security/reauth', {
        method: 'POST'
      });
      
      if (response.ok) {
        setSuccess('Re-authentication successful');
        fetchSecurityStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Re-authentication failed');
      }
    } catch (err) {
      setError('Re-authentication failed');
      console.error('Reauth error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppBar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            Security Settings
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid
              xs={12}
              md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Multi-Factor Authentication
                  </Typography>
                  
                  {securityStatus && (
                    <Stack spacing={2}>
                      <Box>
                        <Chip 
                          label={securityStatus.mfa_enabled ? "Enabled" : "Disabled"}
                          color={securityStatus.mfa_enabled ? "success" : "default"}
                          variant="outlined"
                        />
                      </Box>
                      
                      {securityStatus.mfa_enabled ? (
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={handleDisableMFA}
                          disabled={loading}
                        >
                          Disable MFA
                        </Button>
                      ) : (
                        <Button 
                          variant="contained"
                          onClick={handleSetupMFA}
                          disabled={setupLoading}
                        >
                          {setupLoading ? <CircularProgress size={20} /> : "Setup MFA"}
                        </Button>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid
              xs={12}
              md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Status
                  </Typography>
                  
                  {securityStatus && (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Authentication
                        </Typography>
                        <Typography variant="body1">
                          {new Date(securityStatus.last_auth_at).toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Session Age
                        </Typography>
                        <Typography variant="body1">
                          {securityStatus.session_age_minutes} minutes
                        </Typography>
                      </Box>
                      
                      {securityStatus.session_age_minutes > 5 && (
                        <Button 
                          variant="outlined"
                          onClick={handleReauth}
                          disabled={loading}
                        >
                          Re-authenticate
                        </Button>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Multi-factor authentication adds an extra layer of security to your account. 
                When enabled, you&apos;ll need to enter a code from your authenticator app in addition to your password.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your session is considered recent if you&apos;ve authenticated within the last 5 minutes. 
                Some sensitive admin actions may require re-authentication if your session is older.
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* MFA Setup Dialog */}
        <Dialog open={showSetupDialog} onClose={() => setShowSetupDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Setup Multi-Factor Authentication</DialogTitle>
          <DialogContent>
            {mfaSetup && (
              <Stack spacing={3}>
                <Typography variant="body2">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                </Typography>
                
                <Box display="flex" justifyContent="center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={mfaSetup.qr_code} 
                    alt="MFA QR Code" 
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                </Box>
                
                <Typography variant="body2">
                  Or enter this secret manually: <code>{mfaSetup.secret}</code>
                </Typography>
                
                <Divider />
                
                <Typography variant="h6">Backup Codes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                </Typography>
                
                <Box>
                  {mfaSetup.backup_codes.map((code, index) => (
                    <Chip 
                      key={index} 
                      label={code} 
                      variant="outlined" 
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Typography variant="body2" color="warning.main">
                  ⚠️ Save these codes now - they won&apos;t be shown again!
                </Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSetupDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                setShowSetupDialog(false);
                setShowVerifyDialog(true);
              }}
              variant="contained"
            >
              Next: Verify Setup
            </Button>
          </DialogActions>
        </Dialog>

        {/* MFA Verification Dialog */}
        <Dialog open={showVerifyDialog} onClose={() => setShowVerifyDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Verify MFA Setup</DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Typography variant="body2">
                Enter the 6-digit code from your authenticator app to complete the setup:
              </Typography>
              
              <TextField
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                inputProps={{ maxLength: 6 }}
                fullWidth
              />
              
              <Typography variant="body2" color="text.secondary">
                Or use a backup code:
              </Typography>
              
              <TextField
                label="Backup Code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="Enter backup code"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleVerifyMFA}
              variant="contained"
              disabled={verifyLoading || (!verificationCode.trim() && !backupCode.trim())}
            >
              {verifyLoading ? <CircularProgress size={20} /> : "Verify & Complete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
