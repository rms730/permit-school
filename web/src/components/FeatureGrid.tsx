import {
  Quiz,
  Bolt,
  Insights,
  OndemandVideo,
  Timer,
  SupportAgent,
} from '@mui/icons-material';
import { Stack, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { CardX } from './ui/CardX';
import { Heading } from './ui/Heading';
import { Section } from './ui/Section';

const FEATURES = [
  {
    icon: Quiz,
    title: 'DMV-style questions',
    description: 'Practice with items modeled on the official handbook format and language.',
  },
  {
    icon: Bolt,
    title: 'Personalized review',
    description: 'Fix weak spots with targeted explanations and question retries by topic.',
  },
  {
    icon: OndemandVideo,
    title: 'Audio and read-along',
    description: 'Keep momentum with accessible lesson formats that work on any device.',
  },
  {
    icon: Insights,
    title: 'Progress that sticks',
    description: 'Your accuracy, pace, and trends sync across phone, tablet, and desktop.',
  },
  {
    icon: Timer,
    title: 'Bite-size sessions',
    description: 'Short 5 to 15 minute blocks make studying easy on a busy schedule.',
  },
  {
    icon: SupportAgent,
    title: 'Start free',
    description: 'Practice before upgrading, then scale up only when you are ready.',
  },
];

export function FeatureGrid() {
  const t = useTranslations('Home');

  return (
    <Section
      id="section-features"
      spacing="xl"
      sx={{
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
        <Heading level={2} sx={{ mb: 1.5 }}>
          {t('features.title')}
        </Heading>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: 'auto', textWrap: 'balance' }}
        >
          Modern learning tools built for permit prep, not generic test cramming.
        </Typography>
      </Box>

      <Grid container spacing={2.5} id="features" role="list">
        {FEATURES.map(feature => {
          const Icon = feature.icon;
          return (
            <Grid key={feature.title} role="listitem" xs={12} sm={6} md={4}>
              <CardX
                spacing="relaxed"
                sx={{
                  height: '100%',
                  border: '1px solid rgba(18, 32, 50, 0.12)',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(249,252,255,0.96) 100%)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      width: 58,
                      height: 58,
                      borderRadius: 3,
                      backgroundColor: 'rgba(15,110,207,0.12)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: 30, color: 'primary.main' }} />
                  </Box>

                  <Stack spacing={1}>
                    <Heading level={4}>{feature.title}</Heading>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {feature.description}
                    </Typography>
                  </Stack>
                </Stack>
              </CardX>
            </Grid>
          );
        })}
      </Grid>
    </Section>
  );
}
