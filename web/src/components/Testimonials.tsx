import { Box, Typography, Grid, Card, CardContent, Avatar, Rating, useTheme } from '@mui/material';
import { Container } from './Container';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Student',
    avatar: 'SM',
    rating: 5,
    quote: 'I passed my permit test on the first try! The practice tests were so helpful and the explanations made everything click.',
  },
  {
    name: 'David R.',
    role: 'Parent',
    avatar: 'DR',
    rating: 5,
    quote: 'As a parent, I love being able to track my son\'s progress. The guardian dashboard gives me peace of mind.',
  },
  {
    name: 'Maria L.',
    role: 'Student',
    avatar: 'ML',
    rating: 5,
    quote: 'The bite-sized lessons are perfect for my busy schedule. I can study for just 5 minutes and actually learn something.',
  },
  {
    name: 'Coach Johnson',
    role: 'Driving Instructor',
    avatar: 'CJ',
    rating: 5,
    quote: 'I use Permit School with all my students. The progress tracking helps me focus on what they need to work on.',
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
        backgroundColor: 'background.paper',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="testimonials-heading"
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            What Our Users Say
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join thousands of successful drivers
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 4,
                    flexGrow: 1,
                    position: 'relative',
                  }}
                >
                  {/* Quote icon */}
                  <FormatQuoteIcon
                    sx={{
                      fontSize: 40,
                      color: 'primary.main',
                      opacity: 0.2,
                      position: 'absolute',
                      top: 16,
                      right: 16,
                    }}
                  />

                  <Box sx={{ mb: 3 }}>
                    <Rating value={testimonial.rating} readOnly size="small" />
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      mb: 3,
                      flexGrow: 1,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                        mr: 2,
                        fontWeight: 600,
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Social proof stats */}
        <Box
          sx={{
            mt: 8,
            pt: 6,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                10K+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Students
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                95%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Pass Rate
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                50+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Schools
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                4.9★
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Rating
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
