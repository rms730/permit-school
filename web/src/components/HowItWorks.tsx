"use client";

import {
  PersonAdd,
  Quiz,
  CheckCircle,
} from '@mui/icons-material';
import {
  Container,
  Box,
  Stack,
  Typography,

  useTheme,

} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';

const steps = [
  {
    icon: <PersonAdd sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Create your plan',
    description: 'Tell us about your timeline and we\'ll create a personalized study schedule.',
    visual: (
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid',
          borderColor: 'primary.main',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      />
    ),
  },
  {
    icon: <Quiz sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Practice with adaptive tests',
    description: 'Our AI adapts to your learning style, focusing on areas that need improvement.',
    visual: (
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid',
          borderColor: 'secondary.main',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'secondary.main',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      />
    ),
  },
  {
    icon: <CheckCircle sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Pass with confidence',
    description: 'Get reminders right before test day and walk in knowing you\'re ready.',
    visual: (
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid',
          borderColor: 'primary.main',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      />
    ),
  },
];

export function HowItWorks() {
  const theme = useTheme();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < theme.breakpoints.values.md);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [theme.breakpoints.values.md]);

  return (
    <Box
      component="section"
      id="section-how-it-works"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'grey.50',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h3"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            How it works
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.5 }}
          >
            Three simple steps to get you permit-ready
          </Typography>
        </Box>

        <Grid container spacing={4} id="how-it-works">
          {steps.map((step, index) => (
            <Grid
              key={step.title}
              xs={12}
              md={4}>
              <Stack
                spacing={3}
                alignItems="center"
                textAlign="center"
                sx={{ position: 'relative' }}
              >
                {/* Step number */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    mb: 2,
                  }}
                >
                  {index + 1}
                </Box>

                {/* Icon */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {step.icon}
                </Box>

                {/* Visual element */}
                <Box sx={{ mb: 2 }}>
                  {step.visual}
                </Box>

                {/* Content */}
                <Stack spacing={2}>
                  <Typography variant="h4" component="h4" fontWeight={700}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Progress indicator */}
        {!isMobile && (
          <Box
            sx={{
              position: 'relative',
              mt: 8,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '16.67%',
                right: '16.67%',
                height: '2px',
                backgroundColor: 'primary.main',
                transform: 'translateY(-50%)',
                zIndex: 0,
                pointerEvents: 'none',
              },
            }}
          >
            <Grid container spacing={4}>
              {steps.map((_, index) => (
                <Grid
                  key={index}
                  xs={12}
                  md={4}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      mx: 'auto',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
