"use client";

import { Box, Typography, Grid, Paper, Avatar, useTheme } from '@mui/material';
import { Container } from './Container';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Student',
    content: 'Passed my permit test on the first try! The practice tests were spot-on.',
    rating: 5,
  },
  {
    name: 'Mike R.',
    role: 'Parent',
    content: 'Great for my teen. The progress tracking helped me stay involved.',
    rating: 5,
  },
  {
    name: 'Jennifer L.',
    role: 'Student',
    content: 'The bite-sized lessons made studying so much easier. Highly recommend!',
    rating: 5,
  },
];

export function Testimonials() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="testimonials-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'grey.50',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="testimonials-heading"
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            What Our Students Say
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Join thousands of students who&apos;ve passed their permit test
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={1}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ mb: 3 }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Typography
                      key={i}
                      component="span"
                      sx={{
                        color: 'primary.main',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                      }}
                    >
                      ★
                    </Typography>
                  ))}
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    flexGrow: 1,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  &ldquo;{testimonial.content}&rdquo;
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      backgroundColor: 'primary.main',
                    }}
                  >
                    {testimonial.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            Trusted by 10,000+ students nationwide
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
