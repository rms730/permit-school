"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
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
  CircularProgress,
  Alert,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import AppBar from "@/components/AppBar";

interface BillingKPI {
  active_subscriptions: number;
  past_due_subscriptions: number;
  churn_7d: number;
  churn_30d: number;
  mrr: number;
}

interface PastDueUser {
  user_id: string;
  email: string;
  full_name: string;
  subscription_status: string;
  last_failed_at: string;
  dunning_state: string;
  fail_count: number;
  days_overdue: number;
}

interface RecentInvoice {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  stripe_invoice_id: string;
  status: string;
  amount_due_cents: number;
  created_at: string;
  hosted_invoice_url: string;
  pdf_url: string;
}

export default function AdminBillingPage() {
  const [kpis, setKpis] = useState<BillingKPI | null>(null);
  const [pastDueUsers, setPastDueUsers] = useState<PastDueUser[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      
      // Load KPIs
      const kpisResponse = await fetch('/api/admin/billing/kpis');
      if (kpisResponse.ok) {
        const kpisData = await kpisResponse.json();
        setKpis(kpisData);
      }

      // Load past due users
      const pastDueResponse = await fetch('/api/admin/billing/past-due');
      if (pastDueResponse.ok) {
        const pastDueData = await pastDueResponse.json();
        setPastDueUsers(pastDueData.users || []);
      }

      // Load recent invoices
      const invoicesResponse = await fetch('/api/admin/billing/invoices');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setRecentInvoices(invoicesData.invoices || []);
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSendDunningEmail = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/billing/send-dunning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        // Refresh data
        loadData();
      } else {
        setError('Failed to send dunning email');
      }
    } catch (err) {
      console.error('Error sending dunning email:', err);
      setError('Failed to send dunning email');
    }
  };

  const handleCancelSubscription = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        // Refresh data
        loadData();
      } else {
        setError('Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription');
    }
  };

  const getDunningStateColor = (state: string) => {
    switch (state) {
      case 'email_1': return 'warning';
      case 'email_2': return 'error';
      case 'email_3': return 'error';
      case 'canceled': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'past_due': return 'error';
      case 'canceled': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <CircularProgress />
            <Typography>Loading billing dashboard...</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <AppBar title="Billing Dashboard" />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
              Billing Dashboard
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* KPIs */}
          {kpis && (
            <Stack direction="row" spacing={2}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Subscriptions
                  </Typography>
                  <Typography variant="h4">
                    {kpis.active_subscriptions}
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Past Due
                  </Typography>
                  <Typography variant="h4" color="error">
                    {kpis.past_due_subscriptions}
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    MRR
                  </Typography>
                  <Typography variant="h4">
                    ${kpis.mrr.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Tooltip title="Churn rate over the last 30 days">
                    <Typography color="text.secondary" gutterBottom>
                      30-Day Churn
                    </Typography>
                  </Tooltip>
                  <Typography variant="h4" color="error">
                    {kpis.churn_30d}%
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          )}

          {/* Past Due Users */}
          <Paper variant="outlined">
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Past Due Subscriptions
              </Typography>
              
              {pastDueUsers.length === 0 ? (
                <Typography color="text.secondary">
                  No past due subscriptions found.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Dunning State</TableCell>
                        <TableCell>Failed Attempts</TableCell>
                        <TableCell>Days Overdue</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastDueUsers.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2">
                                {user.full_name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.subscription_status}
                              color={getStatusColor(user.subscription_status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.dunning_state}
                              color={getDunningStateColor(user.dunning_state)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {user.fail_count}
                          </TableCell>
                          <TableCell>
                            {user.days_overdue}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleSendDunningEmail(user.user_id)}
                              >
                                Send Now
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleCancelSubscription(user.user_id)}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>

          {/* Recent Invoices */}
          <Paper variant="outlined">
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Recent Invoices (30 days)
              </Typography>
              
              {recentInvoices.length === 0 ? (
                <Typography color="text.secondary">
                  No recent invoices found.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2">
                                {invoice.full_name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {invoice.email}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            ${(invoice.amount_due_cents / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              color={
                                invoice.status === 'paid' ? 'success' :
                                invoice.status === 'open' ? 'warning' :
                                invoice.status === 'uncollectible' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              {invoice.hosted_invoice_url && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  href={invoice.hosted_invoice_url}
                                  target="_blank"
                                  rel="noopener"
                                >
                                  View
                                </Button>
                              )}
                              {invoice.pdf_url && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  href={invoice.pdf_url}
                                  target="_blank"
                                  rel="noopener"
                                >
                                  PDF
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
