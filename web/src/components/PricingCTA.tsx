import { CheckCircle } from '@mui/icons-material';
import {
  Container,
  Box,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import * as React from 'react';

import { Button } from './Button';

const valuePoints = [
  'Start free. Upgrade when you\'re ready.',
  'No credit card required for free plan',
  'Cancel anytime, no questions asked',
  'Money-back guarantee if not satisfied',
];

export function PricingCTA() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 3,
              fontWeight: 700,
            }}
          >
                         Start free. Upgrade when you&apos;re ready.
          </Typography>
          
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 6, lineHeight: 1.5 }}
          >
            Try our free practice test today. No credit card required, no commitment.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Button
              variant="primary"
              size="lg"
              href="/practice"
              data-cta="pricing-start-free"
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                },
              }}
            >
              Start free practice
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href="#pricing"
              data-cta="pricing-view-pricing"
            >
              View pricing
            </Button>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {valuePoints.map((point, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  padding: '8px 16px',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(34, 197, 94, 0.2)',
                }}
              >
                <CheckCircle sx={{ fontSize: 20, color: '#22c55e' }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {point}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
