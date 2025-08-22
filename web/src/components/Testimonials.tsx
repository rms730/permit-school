import {
  Container,
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import * as React from 'react';

const testimonials = [
  {
    quote: "I was so nervous about the permit test, but Permit School made it feel easy. The questions were exactly like the real thing!",
    author: "Sarah M.",
    role: "New driver",
    rating: 5,
    avatar: "SM",
    beforeAfter: "Passed on first try",
  },
  {
    quote: "As a parent, I love how I can track my daughter's progress. She's learning at her own pace and actually enjoying it.",
    author: "Michael R.",
    role: "Parent",
    rating: 5,
    avatar: "MR",
    beforeAfter: "From 60% to 95% in 2 weeks",
  },
  {
    quote: "The bite-size lessons are perfect for my busy schedule. I can study for 10 minutes here and there throughout the day.",
    author: "Jessica L.",
    role: "Working student",
    rating: 5,
    avatar: "JL",
    beforeAfter: "Ready in 3 weeks",
  },
];

export function Testimonials() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            What our learners say
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.5 }}
          >
            Real stories from drivers who passed with confidence
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          sx={{ mb: 6 }}
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              sx={{
                flex: 1,
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={3} sx={{ flexGrow: 1 }}>
                  {/* Rating */}
                  <Rating
                    value={testimonial.rating}
                    readOnly
                    size="small"
                    sx={{ color: '#fbbf24' }}
                  />

                  {/* Quote */}
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      flexGrow: 1,
                      '&::before': {
                        content: '"""',
                        fontSize: '2rem',
                        color: 'primary.main',
                        lineHeight: 0,
                        marginRight: 1,
                      },
                    }}
                  >
                    {testimonial.quote}
                  </Typography>

                  {/* Author info */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'primary.main',
                        fontWeight: 600,
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {testimonial.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Before/After stat */}
                  <Box
                    sx={{
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      padding: '8px 12px',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'secondary.main',
                      }}
                    >
                      {testimonial.beforeAfter}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Overall stats */}
        <Box
          sx={{
            textAlign: 'center',
            backgroundColor: 'grey.50',
            borderRadius: 3,
            padding: 4,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 3, sm: 6 }}
            justifyContent="center"
            alignItems="center"
          >
            <Box>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                95%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                First-time pass rate
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                4.8★
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average rating
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                10K+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learners helped
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
