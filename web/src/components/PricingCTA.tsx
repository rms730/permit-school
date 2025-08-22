"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const features = [
  'Unlimited practice tests',
  'Real-time feedback',
  'Progress tracking',
  'Mobile-friendly',
  '24/7 support',
  'Money-back guarantee',
];

export function PricingCTA() {
  const theme = useTheme();

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
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Start learning today
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.5 }}
          >
            Get unlimited access to all our practice tests and study materials
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card
            sx={{
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: 4 }}>
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
                sx={{ mb: 3 }}
              >
                One-time payment
              </Typography>

              <Box sx={{ mb: 4 }}>
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

              <Button
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
              </Button>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                30-day money-back guarantee
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
