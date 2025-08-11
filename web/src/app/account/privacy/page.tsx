"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { 
  Download, 
  Delete, 
  Warning, 
  Info, 
  CheckCircle, 
  Error,
  Schedule,
  Security
} from "@mui/icons-material";
import AppBar from "@/components/AppBar";

interface ExportStatus {
  export_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  error: string | null;
  download_url: string | null;
}

interface DeletionStatus {
  request_id: number;
  status: string;
  requested_at: string;
  confirmed_at: string | null;
  executed_at: string | null;
  reason: string | null;
}

export default function AccountPrivacyPage() {
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");

  useEffect(() => {
    fetchPrivacyStatus();
  }, []);

  const fetchPrivacyStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch export status
      const exportResponse = await fetch('/api/account/export');
      if (exportResponse.ok) {
        const exportData = await exportResponse.json();
        if (exportData.status) {
          setExportStatus(exportData);
        }
      }
      
      // Fetch deletion status
      const deletionResponse = await fetch('/api/account/delete');
      if (deletionResponse.ok) {
        const deletionData = await deletionResponse.json();
        if (deletionData.status) {
          setDeletionStatus(deletionData);
        }
      }
    } catch (err) {
      setError('Failed to load privacy status');
      console.error('Privacy status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExport = async () => {
    try {
      setExportLoading(true);
      setError(null);
      
      const response = await fetch('/api/account/export', {
        method: 'POST'
      });
      
      if (response.ok) {
        setSuccess('Data export request created. You will receive an email when it\'s ready.');
        fetchPrivacyStatus(); // Refresh status
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to request data export');
      }
    } catch (err) {
      setError('Failed to request data export');
      console.error('Export request error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadExport = () => {
    if (exportStatus?.download_url) {
      window.open(exportStatus.download_url, '_blank');
    }
  };

  const handleRequestDeletion = async () => {
    if (!deletionReason.trim()) {
      setError('Please provide a reason for deletion');
      return;
    }

    try {
      setDeletionLoading(true);
      setError(null);
      
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: deletionReason })
      });
      
      if (response.ok) {
        setSuccess('Account deletion request created. Please check your email to confirm.');
        setShowDeletionDialog(false);
        setDeletionReason("");
        fetchPrivacyStatus(); // Refresh status
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to request account deletion');
      }
    } catch (err) {
      setError('Failed to request account deletion');
      console.error('Deletion request error:', err);
    } finally {
      setDeletionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'ready': return 'success';
      case 'confirmed': return 'info';
      case 'executed': return 'error';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'ready': return <CheckCircle />;
      case 'confirmed': return <Info />;
      case 'executed': return <Delete />;
      case 'error': return <Error />;
      default: return <Info />;
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
            Privacy & Data Rights
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
            {/* Data Export Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Download color="primary" />
                    <Typography variant="h6">
                      Data Export
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Request a copy of all your personal data stored in our system. 
                    This includes your profile, enrollments, progress, and certificates.
                  </Typography>

                  {exportStatus ? (
                    <Stack spacing={2}>
                      <Box>
                        <Chip 
                          icon={getStatusIcon(exportStatus.status)}
                          label={exportStatus.status.toUpperCase()} 
                          color={getStatusColor(exportStatus.status) as any}
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Requested: {new Date(exportStatus.created_at).toLocaleString()}
                      </Typography>
                      
                      {exportStatus.status === 'ready' && exportStatus.download_url && (
                        <Button 
                          variant="contained" 
                          startIcon={<Download />}
                          onClick={handleDownloadExport}
                          fullWidth
                        >
                          Download Export
                        </Button>
                      )}
                      
                      {exportStatus.status === 'error' && exportStatus.error && (
                        <Alert severity="error">
                          Error: {exportStatus.error}
                        </Alert>
                      )}
                      
                      {exportStatus.status === 'pending' && (
                        <Typography variant="body2" color="text.secondary">
                          Your export is being prepared. This may take a few minutes.
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <Button 
                      variant="contained" 
                      startIcon={<Download />}
                      onClick={handleRequestExport}
                      disabled={exportLoading}
                      fullWidth
                    >
                      {exportLoading ? <CircularProgress size={20} /> : "Request Data Export"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Account Deletion Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Delete color="error" />
                    <Typography variant="h6">
                      Account Deletion
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Request permanent deletion of your account and all associated data. 
                    This action cannot be undone.
                  </Typography>

                  {deletionStatus ? (
                    <Stack spacing={2}>
                      <Box>
                        <Chip 
                          icon={getStatusIcon(deletionStatus.status)}
                          label={deletionStatus.status.toUpperCase()} 
                          color={getStatusColor(deletionStatus.status) as any}
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Requested: {new Date(deletionStatus.requested_at).toLocaleString()}
                      </Typography>
                      
                      {deletionStatus.reason && (
                        <Typography variant="body2" color="text.secondary">
                          Reason: {deletionStatus.reason}
                        </Typography>
                      )}
                      
                      {deletionStatus.status === 'pending' && (
                        <Alert severity="info">
                          Please check your email to confirm the deletion request.
                        </Alert>
                      )}
                      
                      {deletionStatus.status === 'confirmed' && (
                        <Alert severity="warning">
                          Your account deletion has been confirmed and will be processed after the grace period.
                        </Alert>
                      )}
                      
                      {deletionStatus.status === 'executed' && (
                        <Alert severity="error">
                          Your account has been permanently deleted.
                        </Alert>
                      )}
                    </Stack>
                  ) : (
                    <Button 
                      variant="outlined" 
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setShowDeletionDialog(true)}
                      fullWidth
                    >
                      Request Account Deletion
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Information Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Info color="primary" />
                    <Typography variant="h6">
                      What's Included in Your Export
                    </Typography>
                  </Stack>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Personal profile information" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Course enrollments and progress" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle fontSize="small" /></ListItemText>
                      <ListItemText primary="Quiz attempts and scores" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Certificate information" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Seat time records" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Security color="primary" />
                    <Typography variant="h6">
                      Deletion Process
                    </Typography>
                  </Stack>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Info fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="7-day grace period" 
                        secondary="You can cancel the request during this time"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Warning fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Permanent deletion" 
                        secondary="All data will be permanently removed"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Info fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Certificate numbers retained" 
                        secondary="For compliance purposes only"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>

        {/* Deletion Confirmation Dialog */}
        <Dialog 
          open={showDeletionDialog} 
          onClose={() => setShowDeletionDialog(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Warning color="error" />
              <Typography variant="h6">Request Account Deletion</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Alert severity="warning">
                This action will permanently delete your account and all associated data. 
                This cannot be undone.
              </Alert>
              
              <Typography variant="body2">
                Please provide a reason for the deletion request:
              </Typography>
              
              <TextField
                label="Reason for deletion"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Please explain why you want to delete your account..."
              />
              
              <Typography variant="body2" color="text.secondary">
                After submitting, you will receive a confirmation email. 
                Your account will be deleted after a 7-day grace period.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeletionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestDeletion}
              color="error"
              variant="contained"
              disabled={deletionLoading || !deletionReason.trim()}
            >
              {deletionLoading ? <CircularProgress size={20} /> : "Request Deletion"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
