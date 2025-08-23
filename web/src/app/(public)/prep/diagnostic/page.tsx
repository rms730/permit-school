import {
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'Diagnostic Test | College Test Prep | Permit School',
  description: 'Take a free diagnostic test to assess your current skill level and get personalized study recommendations.',
  keywords: 'diagnostic test,ACT diagnostic,SAT diagnostic,skill assessment,college test prep',
};

export default function DiagnosticPage() {
  return (
    <main>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '60vh',
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
              label="Free Diagnostic"
              color="primary"
              sx={{
                mb: 2,
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            />
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Discover Your Starting Point
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
              Take a free diagnostic test to identify your strengths and areas for improvement.
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
                Start Free Diagnostic
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
      {/* What You'll Get Section */}
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
              What You&apos;ll Get
            </Typography>
          <Grid container spacing={4}>
            <Grid xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <AssessmentIcon
                    sx={{
                      fontSize: 48,
                      color: '#f59e0b',
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Skill Assessment
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Identify your current skill level across all test sections and question types.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <TrendingUpIcon
                    sx={{
                      fontSize: 48,
                      color: '#f59e0b',
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Personalized Plan
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get a custom study plan based on your diagnostic results and target score.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <TimerIcon
                    sx={{
                      fontSize: 48,
                      color: '#f59e0b',
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Quick & Focused
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Complete in 30-45 minutes. No commitment required to see your results.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Test Details Section */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid xs={12} md={6}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 4,
                  color: '#1e293b',
                }}
              >
                How It Works
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Choose Your Test"
                    secondary="Select ACT or SAT based on your college goals"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Answer Sample Questions"
                    secondary="Complete a shortened version covering all sections"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Get Instant Results"
                    secondary="See your estimated score and skill breakdown"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Start Your Journey"
                    secondary="Follow your personalized study recommendations"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}
                >
                  Test Format
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Chip
                    label="ACT Format"
                    sx={{
                      m: 1,
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                    }}
                  />
                  <Chip
                    label="SAT Format"
                    sx={{
                      m: 1,
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                    }}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  • 20-30 questions per section
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  • Adaptive difficulty based on your answers
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  • Immediate feedback and explanations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  • Detailed score report with next steps
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          backgroundColor: '#1e1b4b',
          color: 'white',
        }}
      >
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
              Ready to Begin?
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
              Take the first step toward your target score. Your diagnostic results will help create a personalized study plan.
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
              Start Free Diagnostic
            </Button>
          </Box>
        </Container>
      </Box>
    </main>
  );
}
