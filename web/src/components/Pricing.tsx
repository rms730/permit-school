"use client";

import CheckIcon from '@mui/icons-material/Check';
import { Box, Typography, Stack, Chip, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';

import { CheckoutButton } from './billing/CheckoutButton';
import { CardX } from './ui/CardX';
import { Heading } from './ui/Heading';
import { Section } from './ui/Section';

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  stripePriceId?: string;
};

const PLANS: Plan[] = [
  {
    name: 'Plus',
    price: '$9.99',
    period: 'month',
    description: 'Best for students preparing to test in the next 30 days.',
    features: [
      'Unlimited practice tests',
      'Adaptive question sequencing',
      'Detailed rationale for every answer',
      'Progress analytics and readiness score',
      'Completion certificate tracking',
    ],
    cta: 'Choose Plus',
    ctaHref: '/signup',
    popular: true,
    stripePriceId: 'price_plus_monthly',
  },
  {
    name: 'Family',
    price: '$19.99',
    period: 'month',
    description: 'For guardians supporting multiple learners at once.',
    features: [
      'Everything in Plus',
      'Guardian progress visibility',
      'Study reminders',
      'Priority support',
      'Flexible subscription management',
    ],
    cta: 'Choose Family',
    ctaHref: '/signup',
  },
];

export function Pricing() {
  return (
    <Section id="section-pricing" spacing="xl" sx={{ backgroundColor: 'transparent' }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
        <Heading level={2} sx={{ mb: 1.5 }}>
          Pricing that fits your timeline
        </Heading>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto' }}>
          Choose the plan that matches your study pace and upgrade anytime.
        </Typography>
      </Box>

      <Grid container spacing={2.75} id="pricing">
        {PLANS.map(plan => (
          <Grid key={plan.name} xs={12} md={6}>
            <CardX
              spacing="relaxed"
              sx={(theme) => ({
                height: '100%',
                position: 'relative',
                borderColor: plan.popular
                  ? 'primary.main'
                  : alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.24 : 0.12),
                transform: plan.popular ? { xs: 'none', md: 'translateY(-8px)' } : 'none',
                backgroundColor: plan.popular
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.04)
                  : 'background.paper',
              })}
            >
              {plan.popular ? (
                <Chip
                  label="Most Popular"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              ) : null}

              <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                <Box>
                  <Heading level={4} sx={{ mb: 1 }}>
                    {plan.name}
                  </Heading>
                  <Typography variant="h2" sx={{ mb: 0.4 }}>
                    {plan.price}
                    <Typography component="span" variant="h6" color="text.secondary">
                      /{plan.period}
                    </Typography>
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {plan.description}
                  </Typography>
                </Box>

                <Stack spacing={1.2} sx={{ flexGrow: 1 }}>
                  {plan.features.map(feature => (
                    <Stack key={feature} direction="row" spacing={1.1} alignItems="flex-start">
                      <CheckIcon sx={{ color: 'secondary.main', mt: '3px', fontSize: 18 }} />
                      <Typography>{feature}</Typography>
                    </Stack>
                  ))}
                </Stack>

                {plan.stripePriceId ? (
                  <CheckoutButton
                    priceId={plan.stripePriceId}
                    variant="contained"
                    fullWidth
                    size="large"
                  >
                    {plan.cta}
                  </CheckoutButton>
                ) : (
                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    href={plan.ctaHref}
                    fullWidth
                    size="large"
                  >
                    {plan.cta}
                  </Button>
                )}
              </Stack>
            </CardX>
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
