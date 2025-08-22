"use client";

import {
  Container,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";

import AppBar from "@/components/AppBar";

interface HealthStatus {
  status: string;
  time: string;
  responseTime: string;
  supabase: string;
  services: {
    database: string;
    email: string;
    monitoring: string;
  };
}

interface BillingEvent {
  id: string;
  event_type: string;
  created_at: string;
  user_id: string;
  metadata: any;
}

export default function AdminSystemPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch billing events
      const eventsResponse = await fetch('/api/admin/billing/events');
      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        setBillingEvents(events.slice(0, 10)); // Get latest 10
      }
      
      // Fetch initial health status
      await fetchHealthStatus();
    } catch (err) {
      setError('Failed to load system data');
      console.error('System data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  const fetchHealthStatus = async () => {
    try {
      setHealthLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      console.error('Health check error:', err);
      setHealthStatus({
        status: 'error',
        time: new Date().toISOString(),
        responseTime: 'N/A',
        supabase: 'error',
        services: {
          database: 'error',
          email: 'unknown',
          monitoring: 'unknown',
        }
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'configured':
        return 'success';
      case 'error':
        return 'error';
      case 'disabled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok':
        return 'Healthy';
      case 'configured':
        return 'Configured';
      case 'error':
        return 'Error';
      case 'disabled':
        return 'Disabled';
      default:
        return status;
    }
  };

  return (
    <>
      <AppBar title="System Monitoring" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4">System Status</Typography>

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          {/* Health Status Card */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Health Check</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchHealthStatus}
                  disabled={healthLoading}
                  startIcon={healthLoading ? <CircularProgress size={16} /> : null}
                >
                  Run Check
                </Button>
              </Stack>
              
              {healthStatus ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Overall Status
                    </Typography>
                    <Chip
                      label={getStatusText(healthStatus.status)}
                      color={getStatusColor(healthStatus.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Response Time
                    </Typography>
                    <Typography variant="body1">{healthStatus.responseTime}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Check
                    </Typography>
                    <Typography variant="body1">
                      {new Date(healthStatus.time).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Services
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={`Database: ${getStatusText(healthStatus.services.database)}`}
                        color={getStatusColor(healthStatus.services.database) as any}
                        size="small"
                      />
                      <Chip
                        label={`Email: ${getStatusText(healthStatus.services.email)}`}
                        color={getStatusColor(healthStatus.services.email) as any}
                        size="small"
                      />
                      <Chip
                        label={`Monitoring: ${getStatusText(healthStatus.services.monitoring)}`}
                        color={getStatusColor(healthStatus.services.monitoring) as any}
                        size="small"
                      />
                    </Stack>
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">No health data available</Typography>
              )}
            </CardContent>
          </Card>

          {/* Configuration Status */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Configuration</Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Resend API Key
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {process.env.RESEND_API_KEY ? '***configured***' : 'Not configured'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sentry DSN
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {process.env.SENTRY_DSN ? '***configured***' : 'Not configured'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    App Base URL
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {process.env.APP_BASE_URL || 'Not configured'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Recent Billing Events */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Billing Events</Typography>
              {billingEvents.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Event Type</TableCell>
                        <TableCell>User ID</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billingEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Chip label={event.event_type} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {event.user_id.slice(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(event.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No billing events found</Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
