"use client";

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from './Button';
import { Container } from './Container';

export function CtaBanner() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="cta-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            id="cta-heading"
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
            }}
          >
            Ready to Get Your Permit?
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join thousands of students who&apos;ve passed their permit test with confidence
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              href="/practice"
              variant="secondary"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              Start Free Practice Test
            </Button>
            
            <Button
              href="/signup"
              variant="ghost"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
