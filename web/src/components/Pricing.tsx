"use client";

import { Box, Typography, Grid, Card, CardContent, Stack, Chip, Button, Container } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '1 practice test',
      'Basic progress tracking',
      'Mobile-friendly',
    ],
    cta: 'Start Free',
    ctaHref: '/practice',
    popular: false,
  },
  {
    name: 'Plus',
    price: '$9.99',
    period: 'month',
    description: 'Everything you need to pass',
    features: [
      'Unlimited practice tests',
      'Detailed explanations',
      'Progress analytics',
      'Offline access',
      'Certificate of completion',
    ],
    cta: 'Start Plus Trial',
    ctaHref: '/signup',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$19.99',
    period: 'month',
    description: 'For schools and instructors',
    features: [
      'Everything in Plus',
      'Classroom management',
      'Student progress reports',
      'Custom content creation',
      'Priority support',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    popular: false,
  },
];

export function Pricing() {
  return (
    <Box
      component="section"
      id="section-pricing"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Choose the plan that fits your needs
          </Typography>
        </Box>

        <Grid container spacing={4} id="pricing">
          {plans.map((plan) => (
            <Grid key={plan.name} item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  ...(plan.popular && {
                    border: 2,
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  }),
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack spacing={3} sx={{ flexGrow: 1 }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                        {plan.price}
                        <Typography component="span" variant="h6" color="text.secondary">
                          /{plan.period}
                        </Typography>
                      </Typography>
                      <Typography color="text.secondary">{plan.description}</Typography>
                    </Box>

                    <Stack spacing={2} sx={{ flexGrow: 1 }}>
                      {plan.features.map((feature) => (
                        <Stack key={feature} direction="row" spacing={2} alignItems="center">
                          <CheckIcon color="primary" />
                          <Typography>{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      href={plan.ctaHref}
                      fullWidth
                      size="large"
                    >
                      {plan.cta}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
