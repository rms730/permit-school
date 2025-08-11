"use client";

import * as React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School,
  TrendingUp,
  Security,
  AccessTime,
  Star,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AppBarV2 from '@/components/AppBarV2';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const benefits = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Interactive Learning',
      description: 'Engage with dynamic content designed for modern learners',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security',
    },
    {
      icon: <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Learn at Your Pace',
      description: 'Study when it works for you, 24/7 access',
    },
  ];

  const stats = [
    { label: 'Students', value: '10K+' },
    { label: 'Courses', value: '50+' },
    { label: 'Success Rate', value: '95%' },
  ];

  return (
    <>
      <AppBarV2 />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00BCD4 0%, #7C4DFF 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                      mb: 2,
                    }}
                  >
                    Master Your Permit Test
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 400,
                      opacity: 0.9,
                      mb: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    Interactive, engaging, and designed for success. 
                    Join thousands of students who've passed their permit test with confidence.
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/signup')}
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    Start Learning Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/courses')}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Browse Courses
                  </Button>
                </Stack>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {stats.map((stat, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 400,
                }}
              >
                {/* Placeholder for hero illustration */}
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 400,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Typography variant="h6" sx={{ opacity: 0.7 }}>
                    Interactive Learning Platform
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Why Choose Permit School?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            We've designed the perfect learning experience for modern students
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%)',
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
            >
              Join thousands of students who are already learning with Permit School
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/signup')}
                endIcon={<ArrowForward />}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Start Your Journey
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
}
