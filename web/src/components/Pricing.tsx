"use client";

import { Box, Typography, Grid, Paper, Chip, useTheme } from '@mui/material';
import { Button } from './Button';
import { Container } from './Container';

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
    name: 'Pro',
    price: '$9.99',
    period: 'month',
    description: 'Everything you need to pass',
    features: [
      'Unlimited practice tests',
      'Detailed explanations',
      'Progress analytics',
      'Offline access',
      'Certificate tracking',
    ],
    cta: 'Start Pro Trial',
    ctaHref: '/signup',
    popular: true,
  },
  {
    name: 'Classroom',
    price: 'Contact',
    period: 'us',
    description: 'For schools and organizations',
    features: [
      'Everything in Pro',
      'Student management',
      'Progress reports',
      'Admin dashboard',
      'Custom branding',
    ],
    cta: 'Contact Sales',
    ctaHref: '/schools',
    popular: false,
  },
];

export function Pricing() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="pricing"
      aria-labelledby="pricing-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="pricing-heading"
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Choose the plan that&apos;s right for you
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={plan.popular ? 8 : 1}
                sx={{
                  p: 4,
                  height: '100%',
                  position: 'relative',
                  border: plan.popular ? 2 : 1,
                  borderColor: plan.popular ? 'primary.main' : 'grey.200',
                  borderRadius: 2,
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {plan.period === 'forever' ? 'forever' : 
                     plan.period === 'us' ? '' : `per ${plan.period}`}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {plan.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  {plan.features.map((feature, featureIndex) => (
                    <Box
                      key={featureIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </Typography>
                      </Box>
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  href={plan.ctaHref}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  fullWidth
                  size="large"
                >
                  {plan.cta}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
