import { Metadata } from 'next';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material';
import { CheckCircle, School, Timer, TrendingUp } from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Driver Permits | Pass Your DMV Test | Permit School',
  description:
    'DMV‑style practice tests, smart explanations, and bite‑size lessons. Start free and pass your permit test with confidence.',
  openGraph: {
    title: 'Driver Permits | Pass Your DMV Test | Permit School',
    description:
      'DMV‑style practice tests, smart explanations, and bite‑size lessons. Start free and pass your permit test with confidence.',
    images: ['/og-hero.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Driver Permits | Pass Your DMV Test | Permit School',
    description:
      'DMV‑style practice tests, smart explanations, and bite‑size lessons. Start free and pass your permit test with confidence.',
  },
  keywords: [
    'driver permit test',
    'DMV practice test',
    'driver permit',
    'driving test prep',
    'driver handbook',
    'permit test practice',
    'California permit',
    'Texas permit',
  ],
};

export default function PermitsPage() {
  return (
    <>
      {/* Hero Section */}
      <Box
        component="main"
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
            <Chip 
              label="Driver Permits" 
              color="primary" 
              sx={{ mb: 2, color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
            
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
              Pass your permit test—on your first try.
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

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backgroundColor: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 6,
              color: '#1e293b',
            }}
          >
            Why Choose Permit School?
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <School sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    DMV-Approved Content
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our practice tests are based on official DMV handbooks and real exam questions. Study exactly what you'll be tested on.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Timer sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Flexible Learning
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Study at your own pace with bite-size lessons and practice tests. Perfect for busy schedules.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <TrendingUp sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Track Your Progress
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Monitor your improvement with detailed analytics and personalized study recommendations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* States Section */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 6,
              color: '#1e293b',
            }}
          >
            Available States
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                height: '100%', 
                border: '2px solid #e2e8f0',
                '&:hover': {
                  borderColor: '#3b82f6',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                    California
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Complete online driver education course
                  </Typography>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="contained"
                    fullWidth
                    sx={{ fontWeight: 600 }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                height: '100%', 
                border: '2px solid #e2e8f0',
                '&:hover': {
                  borderColor: '#3b82f6',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                    Texas
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Coming soon - Driver education and permit prep
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled
                    sx={{ fontWeight: 600 }}
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, backgroundColor: '#1e293b', color: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 3,
              }}
            >
              Ready to Get Your Permit?
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.5,
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
              }}
            >
              Join thousands of students who have successfully passed their permit test with our proven study method.
            </Typography>

            <Button
              component={Link}
              href="/signup"
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
              }}
            >
              Start Your Free Trial
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
