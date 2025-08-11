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
} from "@mui/material";
import { getEntitlementForUserClient } from "@/lib/entitlementsClient";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import AppBar from "@/components/AppBar";

interface Subscription {
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function BillingPage() {
  const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createPagesBrowserClient();

  useEffect(() => {
    async function loadBillingData() {
      try {
        // Check entitlement
        const { active } = await getEntitlementForUserClient('CA');
        setIsEntitled(active);

        if (active) {
          // Get subscription details
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('status, current_period_end, cancel_at_period_end')
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
            .single();

          if (!subError && subData) {
            setSubscription(subData);
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
                      
                      {subscription.cancel_at_period_end && (
                        <Alert severity="warning">
                          Your subscription will be canceled at the end of the current billing period.
                        </Alert>
                      )}
                    </>
                  )}
                </Stack>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  startIcon={portalLoading ? <CircularProgress size={20} /> : null}
                  fullWidth
                >
                  {portalLoading ? 'Loading...' : 'Manage Billing'}
                </Button>
              </CardActions>
            </Card>
          )}
        </Stack>
      </Paper>
    </Container>
    </>
  );
}
