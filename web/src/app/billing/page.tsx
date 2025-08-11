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
  CardActions,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Link,
} from "@mui/material";
import { getEntitlementForUserClient } from "@/lib/entitlementsClient";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import AppBar from "@/components/AppBar";

interface Subscription {
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface BillingSummary {
  subscription_status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  latest_invoice_status: string;
  latest_invoice_amount: number;
  latest_invoice_date: string;
  dunning_state: string;
  next_action_at: string;
  fail_count: number;
}

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  currency: string;
  hosted_invoice_url: string;
  pdf_url: string;
  created_at: string;
  period_start: string;
  period_end: string;
}

export default function BillingPage() {
  const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createPagesBrowserClient();

  useEffect(() => {
    async function loadBillingData() {
      try {
        // Check entitlement
        const { active } = await getEntitlementForUserClient('CA');
        setIsEntitled(active);

        if (active) {
          // Get billing summary
          const summaryResponse = await fetch('/api/billing/summary');
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            setBillingSummary(summaryData);
            setSubscription({
              status: summaryData.subscription_status,
              current_period_end: summaryData.current_period_end,
              cancel_at_period_end: summaryData.cancel_at_period_end,
            });
          }

          // Get invoices
          const invoicesResponse = await fetch('/api/billing/invoices');
          if (invoicesResponse.ok) {
            const invoicesData = await invoicesResponse.json();
            setInvoices(invoicesData.invoices || []);
          }
        }
      } catch (err) {
        console.error('Error loading billing data:', err);
        setError('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, [supabase]);

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout session');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout process');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create portal session');
        return;
      }

      // Redirect to Stripe Portal
      window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
      setError('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to cancel subscription');
        return;
      }

      // Reload billing data
      window.location.reload();
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setResumeLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resume subscription');
        return;
      }

      // Reload billing data
      window.location.reload();
    } catch (err) {
      console.error('Resume error:', err);
      setError('Failed to resume subscription');
    } finally {
      setResumeLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <CircularProgress />
            <Typography>Loading billing information...</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <AppBar title="Billing & Subscription" />
      <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" gutterBottom>
            Billing & Subscription
          </Typography>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {!isEntitled ? (
            // Not subscribed - show upgrade option
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">
                    Upgrade to Premium
                  </Typography>
                  <Typography variant="body1">
                    Get access to all course units and features with our premium subscription.
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5" color="primary">
                      $9.99
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per month
                    </Typography>
                  </Stack>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ✓ Access to all course units
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ✓ Unlimited practice quizzes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ✓ Progress tracking
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  startIcon={checkoutLoading ? <CircularProgress size={20} /> : null}
                  fullWidth
                >
                  {checkoutLoading ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardActions>
            </Card>
          ) : (
            // Subscribed - show status and management
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      Subscription Status
                    </Typography>
                    {subscription && (
                      <Chip
                        label={getStatusText(subscription.status)}
                        color={getStatusColor(subscription.status)}
                        size="small"
                      />
                    )}
                  </Stack>
                  
                  {subscription && (
                    <>
                      <Typography variant="body1">
                        Your subscription is currently active.
                      </Typography>
                      
                      {subscription.current_period_end && (
                        <Typography variant="body2" color="text.secondary">
                          Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                        </Typography>
                      )}
                      
                      {billingSummary && billingSummary.dunning_state !== 'none' && (
                        <Alert severity="warning">
                          Payment issue detected. Please update your payment method to avoid service interruption.
                          {billingSummary.fail_count > 0 && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Failed payment attempts: {billingSummary.fail_count}
                            </Typography>
                          )}
                        </Alert>
                      )}
                      
                      {subscription.cancel_at_period_end && (
                        <Alert severity="info">
                          Your subscription will be canceled at the end of the current billing period.
                        </Alert>
                      )}
                    </>
                  )}
                </Stack>
              </CardContent>
              <CardActions>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    startIcon={portalLoading ? <CircularProgress size={20} /> : null}
                    sx={{ flex: 1 }}
                  >
                    {portalLoading ? 'Loading...' : 'Manage Billing'}
                  </Button>
                  
                  {subscription?.cancel_at_period_end ? (
                    <Button
                      variant="contained"
                      onClick={handleResumeSubscription}
                      disabled={resumeLoading}
                      startIcon={resumeLoading ? <CircularProgress size={20} /> : null}
                      sx={{ flex: 1 }}
                    >
                      {resumeLoading ? 'Processing...' : 'Resume Subscription'}
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      startIcon={cancelLoading ? <CircularProgress size={20} /> : null}
                      sx={{ flex: 1 }}
                    >
                      {cancelLoading ? 'Processing...' : 'Cancel Subscription'}
                    </Button>
                  )}
                </Stack>
              </CardActions>
                          </Card>
            )}

            {/* Invoices Section */}
            {isEntitled && invoices.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom>
                  Invoice History
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id || invoice.stripe_invoice_id}>
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
                                <Link href={invoice.hosted_invoice_url} target="_blank" rel="noopener">
                                  <Button size="small" variant="outlined">
                                    View
                                  </Button>
                                </Link>
                              )}
                              {invoice.pdf_url && (
                                <Link href={invoice.pdf_url} target="_blank" rel="noopener">
                                  <Button size="small" variant="outlined">
                                    PDF
                                  </Button>
                                </Link>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
