"use client";

import CheckIcon from '@mui/icons-material/Check';
import {
  Box,
  Typography,
  Stack,
} from '@mui/material';

import { CheckoutButton } from './billing/CheckoutButton';
import { CardX } from './ui/CardX';
import { Heading } from './ui/Heading';
import { Section } from './ui/Section';

const features = [
  'Unlimited practice tests',
  'Real-time feedback',
  'Progress tracking',
  'Mobile-friendly',
  '24/7 support',
  'Money-back guarantee',
];

export function PricingCTA() {
  return (
    <Section 
      id="section-pricing"
      maxWidth="lg"
      spacing="lg"
      sx={{ backgroundColor: 'background.default' }}
    >
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Heading level={2} sx={{ mb: 2, fontWeight: 700 }}>
          Start learning today
        </Heading>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.5 }}
        >
          Get unlimited access to all our practice tests and study materials
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CardX
          sx={{
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                $29.99
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
              >
                One-time payment
              </Typography>
            </Box>

            <Box>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    textAlign: 'left',
                  }}
                >
                  <CheckIcon
                    sx={{
                      color: 'success.main',
                      mr: 2,
                      fontSize: 20,
                    }}
                  />
                  <Typography variant="body1">{feature}</Typography>
                </Box>
              ))}
            </Box>

            <CheckoutButton
              priceId="price_one_time"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Get Started Now
            </CheckoutButton>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              30-day money-back guarantee
            </Typography>
          </Stack>
        </CardX>
      </Box>
    </Section>
  );
}
