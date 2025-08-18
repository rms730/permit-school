"use client";

import { Container, Box, Stack, Typography, Button, Chip, TextField } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function Hero() {
  return (
    <Box 
      component="section" 
      id="section-hero"
      sx={{
        bgcolor: (t) => t.palette.mode === 'light' ? 'grey.50' : 'background.default',
        py: { xs: 8, md: 12 }
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4} alignItems={{ xs: 'stretch', md: 'center' }} textAlign={{ xs: 'left', md: 'center' }}>
          <Typography variant="h2" fontWeight={800}>
            Pass your DMV permit test—fast, confident, first try.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 840, mx: { md: 'auto' } }}>
            Adaptive practice, bite‑size lessons, and real‑world questions built to help new drivers and parents get permit‑ready without the stress.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              size="large" 
              variant="contained" 
              data-testid="cta-hero-primary" 
              href="/practice"
            >
              Start free practice test
            </Button>
            <Button 
              size="large" 
              variant="outlined" 
              data-testid="cta-hero-secondary" 
              href="#pricing"
            >
              See pricing
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'center' }} flexWrap="wrap" useFlexGap>
            <Chip icon={<CheckCircleIcon />} label="Adaptive practice" />
            <Chip icon={<CheckCircleIcon />} label="Instant explanations" />
            <Chip icon={<CheckCircleIcon />} label="Parent dashboard" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Over 10,000 learners. 4.8★ average session rating.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
