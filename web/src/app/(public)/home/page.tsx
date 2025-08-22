import { Box, Container, Typography } from '@mui/material';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pass Your California Permit Test | Permit School',
  description:
    'DMV‑style practice tests, smart explanations, and bite‑size lessons. Start free and pass with confidence.',
  openGraph: {
    title: 'Pass Your California Permit Test | Permit School',
    description:
      'DMV‑style practice tests, smart explanations, and bite‑size lessons. Start free and pass with confidence.',
    images: ['/og-hero.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pass Your California Permit Test | Permit School',
    description:
      'DMV‑style practice tests, smart explanations, and bite‑size lessons. Start free and pass with confidence.',
  },
  keywords: [
    'California permit test',
    'DMV practice test',
    'driver permit',
    'driving test prep',
    'California driver handbook',
    'permit test practice',
  ],
};

export default function HomePage() {
  return (
    <>
      <Box
        component="main"
        id="content"
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0b1220 0%, #1e293b 50%, #334155 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.75rem', md: '3.5rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Pass your California permit test—on your first try.
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.5,
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
              }}
            >
              Study exactly what the DMV asks. Smart practice tests, instant feedback, and bite‑size lessons designed for busy people.
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Coming soon: Full marketing page with all components
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}
