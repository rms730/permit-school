"use client";

import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { Container } from './Container';

const steps = [
  {
    number: '1',
    title: 'Take a practice test',
    description: 'Start with a free practice test to see where you stand.',
  },
  {
    number: '2',
    title: 'Study bite-sized lessons',
    description: 'Learn from official handbooks broken into digestible chunks.',
  },
  {
    number: '3',
    title: 'Track your progress',
    description: 'See your improvement and get ready for the real test.',
  },
];

export function HowItWorks() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'grey.50',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="how-it-works-heading"
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Get ready for your permit test in three simple steps
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {step.number}
                </Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
