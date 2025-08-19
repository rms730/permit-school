import { Metadata } from 'next';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Chip, Divider } from '@mui/material';
import { School, Timer, TrendingUp, Assessment, Psychology, EmojiEvents } from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'College Test Prep | ACT & SAT Preparation | Permit School',
  description:
    'Master the ACT and SAT with adaptive practice tests, detailed score reports, and personalized study plans. Boost your college application.',
  openGraph: {
    title: 'College Test Prep | ACT & SAT Preparation | Permit School',
    description:
      'Master the ACT and SAT with adaptive practice tests, detailed score reports, and personalized study plans. Boost your college application.',
    images: ['/og-hero.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'College Test Prep | ACT & SAT Preparation | Permit School',
    description:
      'Master the ACT and SAT with adaptive practice tests, detailed score reports, and personalized study plans. Boost your college application.',
  },
  keywords: [
    'ACT prep',
    'SAT prep',
    'college test prep',
    'ACT practice test',
    'SAT practice test',
    'college admissions',
    'test preparation',
    'standardized testing',
  ],
};

export default function PrepPage() {
  return (
    <>
      {/* Hero Section */}
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Chip 
              label="College Test Prep" 
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
              Master the ACT & SAT
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
              Adaptive practice tests, detailed score reports, and personalized study plans to boost your college application.
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
                  backgroundColor: '#f59e0b',
                  '&:hover': {
                    backgroundColor: '#d97706',
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

      {/* Tests Section */}
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
            Choose Your Test
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={5}>
              <Card sx={{ 
                height: '100%', 
                border: '2px solid #e2e8f0',
                '&:hover': {
                  borderColor: '#f59e0b',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h3" component="h3" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                    ACT
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    English, Math, Reading, Science
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Score Range: 1-36
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Composite score based on section averages
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="contained"
                    fullWidth
                    sx={{ 
                      fontWeight: 600,
                      backgroundColor: '#f59e0b',
                      '&:hover': {
                        backgroundColor: '#d97706',
                      },
                    }}
                  >
                    Start ACT Prep
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={5}>
              <Card sx={{ 
                height: '100%', 
                border: '2px solid #e2e8f0',
                '&:hover': {
                  borderColor: '#f59e0b',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h3" component="h3" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                    SAT
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Reading & Writing, Math
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Score Range: 400-1600
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total score from section sums
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="contained"
                    fullWidth
                    sx={{ 
                      fontWeight: 600,
                      backgroundColor: '#f59e0b',
                      '&:hover': {
                        backgroundColor: '#d97706',
                      },
                    }}
                  >
                    Start SAT Prep
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
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
            Why Choose Our Test Prep?
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Assessment sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Adaptive Practice Tests
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Practice tests that adapt to your skill level, focusing on areas where you need the most improvement.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <TrendingUp sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Detailed Score Reports
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get comprehensive score reports with section breakdowns, skill analysis, and improvement recommendations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Psychology sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Personalized Study Plans
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    AI-powered study plans that adapt to your learning style and target your weakest areas.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Test Types Section */}
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
            Practice Test Types
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <EmojiEvents sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Full-Length Mock Tests
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Complete practice tests that simulate the real exam experience with accurate timing and scoring.
                  </Typography>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderColor: '#f59e0b', color: '#f59e0b' }}
                  >
                    Try Mock Test
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <School sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Section Practice
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Focus on specific sections to build confidence and improve your weakest areas.
                  </Typography>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderColor: '#f59e0b', color: '#f59e0b' }}
                  >
                    Practice Sections
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Timer sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    Diagnostic Tests
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Quick assessments to identify your current skill level and create a personalized study plan.
                  </Typography>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderColor: '#f59e0b', color: '#f59e0b' }}
                  >
                    Take Diagnostic
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, backgroundColor: '#1e1b4b', color: 'white' }}>
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
              Ready to Boost Your Score?
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
              Join thousands of students who have improved their ACT and SAT scores with our proven test prep platform.
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
                backgroundColor: '#f59e0b',
                '&:hover': {
                  backgroundColor: '#d97706',
                },
              }}
            >
              Start Your Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Disclaimer Footer */}
      <Box sx={{ py: 4, backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', fontSize: '0.875rem' }}
          >
            SAT® is a registered trademark of the College Board. ACT® is a registered trademark of ACT, Inc. 
            Permit School is not affiliated with or endorsed by the College Board or ACT, Inc.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
