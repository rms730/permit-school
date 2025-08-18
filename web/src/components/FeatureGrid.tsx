import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Container } from './Container';

const features = [
  {
    title: 'Adaptive practice',
    description: 'Targets weak spots with every session.',
  },
  {
    title: 'Bite‑sized lessons',
    description: 'Master topics in minutes, not hours.',
  },
  {
    title: 'Instant explanations',
    description: 'Why an answer is right (and wrong).',
  },
  {
    title: 'Guardian & classroom views',
    description: 'Progress at a glance.',
  },
  {
    title: 'Works offline',
    description: 'Perfect for quick study moments.',
  },
  {
    title: 'Multiple languages',
    description: 'Learn comfortably in your language.',
  },
];

export function FeatureGrid() {
  return (
    <Box
      component="section"
      aria-labelledby="features-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="features-heading"
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Why Choose Permit School?
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Modern learning designed for today&apos;s drivers
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
