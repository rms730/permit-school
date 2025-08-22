import {
  Quiz,
  Bolt,
  Insights,
  OndemandVideo,
  Timer,
  SupportAgent,
} from '@mui/icons-material';
import {
  Grid,
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Container,
} from '@mui/material';
import {useTranslations} from 'next-intl';
import * as React from 'react';

const features = [
  {
    icon: <Quiz sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'DMV-style questions',
    description: 'Practice with items modeled on the official handbook.',
  },
  {
    icon: <Bolt sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Personalized review',
    description: 'Fix weak spots with smart explanations.',
  },
  {
    icon: <OndemandVideo sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Audio & read-along',
    description: 'Learn hands-free on the go.',
  },
  {
    icon: <Insights sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Progress that sticks',
    description: 'Resume anywhere—phone, tablet, or laptop.',
  },
  {
    icon: <Timer sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Bite-size lessons',
    description: 'Short sessions that fit your day, from 5 to 15 minutes.',
  },
  {
    icon: <SupportAgent sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Try free—cancel anytime',
    description: 'Start in 60 seconds. No credit card for the free plan.',
  },
];

export function FeatureGrid() {
  const t = useTranslations('Home');
  return (
    <Box
      component="section"
      id="section-features"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h3" sx={{ mb: 2, fontWeight: 700 }}>
            {t('features.title')}
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.5 }}
          >
                             Modern learning designed for today&apos;s drivers
          </Typography>
        </Box>

        <Grid container spacing={3} id="features" role="list">
          {features.map((feature, index) => (
            <Grid key={feature.title} item xs={12} sm={6} md={4} role="listitem">
              <Card
                sx={{
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
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    
                    <Stack spacing={1}>
                      <Typography variant="h6" component="h3" fontWeight={700}>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
