import {
  EmojiEvents as EmojiEventsIcon,
  Timer as TimerIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
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
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'Mock Test | College Test Prep | Permit School',
  description: 'Take a full-length practice test that simulates the real ACT or SAT exam experience with accurate timing and scoring.',
  keywords: 'mock test,practice test,ACT practice,SAT practice,full length test,college test prep',
};

export default function MockTestPage() {
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
              label="Full-Length Test"
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
              Practice Like It&apos;s the Real Thing
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
              Take a full-length mock test with real exam conditions and get your predicted score.
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
                Take Mock Test
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
      {/* Test Warning */}
      <Box sx={{ py: 4, backgroundColor: '#fef3c7' }}>
        <Container maxWidth="lg">
          <Alert
            icon={<WarningIcon fontSize="inherit" />}
            severity="warning"
            sx={{
              backgroundColor: 'transparent',
              border: '1px solid #f59e0b',
              color: '#92400e',
              '& .MuiAlert-icon': {
                color: '#f59e0b',
              },
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              This is a full-length practice test
            </Typography>
            <Typography variant="body1">
              Plan for 3-4 hours of uninterrupted time. Just like the real exam, you&apos;ll have strict timing for each section. 
              We recommend taking this test in a quiet environment with minimal distractions.
            </Typography>
          </Alert>
        </Container>
      </Box>
      {/* Test Features Section */}
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
            Authentic Test Experience
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
                    Real Timing
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Exact time limits for each section, just like the actual exam. Build your pacing skills.
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
                    Accurate Scoring
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get your predicted score based on official scoring algorithms and curve data.
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
                  <EmojiEventsIcon
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
                    Detailed Reports
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Comprehensive score analysis with section breakdowns and improvement recommendations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Test Formats Section */}
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
            Choose Your Test
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid xs={12} sm={6} md={5}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px solid #e2e8f0',
                  '&:hover': {
                    borderColor: '#f59e0b',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#1e293b',
                    }}
                  >
                    ACT
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    English, Math, Reading, Science
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      Total Time: 3 hours
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      215 questions across 4 sections
                    </Typography>
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="English (45 min)"
                        secondary="75 questions"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Math (60 min)"
                        secondary="60 questions"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reading (35 min)"
                        secondary="40 questions"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Science (35 min)"
                        secondary="40 questions"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </List>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      fontWeight: 600,
                      backgroundColor: '#f59e0b',
                      '&:hover': {
                        backgroundColor: '#d97706',
                      },
                    }}
                  >
                    Take ACT Mock Test
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={5}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px solid #e2e8f0',
                  '&:hover': {
                    borderColor: '#f59e0b',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#1e293b',
                    }}
                  >
                    SAT
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Reading & Writing, Math
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      Total Time: 3 hours
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      154 questions across 2 sections
                    </Typography>
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reading & Writing (64 min)"
                        secondary="54 questions"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Math (70 min)"
                        secondary="44 questions"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="10-minute break"
                        secondary="Between sections"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem sx={{ minHeight: '48px' }}>
                      {/* Spacer to align with ACT card */}
                    </ListItem>
                  </List>
                  <Button
                    component={Link}
                    href="/signup"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      fontWeight: 600,
                      backgroundColor: '#f59e0b',
                      '&:hover': {
                        backgroundColor: '#d97706',
                      },
                    }}
                  >
                    Take SAT Mock Test
                  </Button>
                </CardContent>
              </Card>
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
              Ready for Your Mock Test?
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
              Set aside 3-4 hours for the full experience. You can pause between sections if needed, but timing within sections is strict.
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
              Start Mock Test
            </Button>
          </Box>
        </Container>
      </Box>
      {/* Disclaimer */}
      <Box sx={{ py: 4, backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontSize: '0.875rem',
            }}
          >
            SAT® is a registered trademark of the College Board. ACT® is a registered trademark of ACT, Inc. 
            Permit School is not affiliated with or endorsed by the College Board or ACT, Inc.
          </Typography>
        </Container>
      </Box>
    </main>
  );
}
