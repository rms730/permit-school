"use client";

import { PersonAdd, Quiz, CheckCircle } from '@mui/icons-material';
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';
import * as React from 'react';

import { Heading } from './ui/Heading';
import { Section } from './ui/Section';

const STEPS = [
  {
    icon: PersonAdd,
    title: 'Create your plan',
    description:
      'Answer a few onboarding questions and get a study path that fits your timeline.',
  },
  {
    icon: Quiz,
    title: 'Practice with adaptive tests',
    description:
      'Questions adjust as you improve so each session targets your highest-impact gaps.',
  },
  {
    icon: CheckCircle,
    title: 'Walk in confident',
    description:
      'Use readiness tracking and final review drills to feel prepared on test day.',
  },
];

export function HowItWorks() {
  const showConnector = useMediaQuery('(min-width:900px)');

  return (
    <Section
      id="section-how-it-works"
      spacing="xl"
      sx={(theme) => ({
        background:
          theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                theme.palette.secondary.main,
                0.08
              )} 100%)`
            : 'linear-gradient(180deg, rgba(15,110,207,0.04) 0%, rgba(23,134,111,0.03) 100%)',
      })}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
        <Heading level={2} sx={{ mb: 1.5 }}>
          How it works
        </Heading>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 660, mx: 'auto' }}>
          Three clear steps from first login to DMV-ready confidence.
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {showConnector ? (
          <Box
            aria-hidden
            sx={(theme) => ({
              position: 'absolute',
              left: '12%',
              right: '12%',
              top: 48,
              height: 2,
              background:
                theme.palette.mode === 'dark'
                  ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.55)} 0%, ${alpha(
                      theme.palette.secondary.main,
                      0.6
                    )} 100%)`
                  : 'linear-gradient(90deg, rgba(15,110,207,0.4) 0%, rgba(23,134,111,0.45) 100%)',
              zIndex: 0,
            })}
          />
        ) : null}

        <Grid container spacing={3.25} id="how-it-works" sx={{ position: 'relative', zIndex: 1 }}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <Grid key={step.title} xs={12} md={4}>
                <Stack
                  spacing={2.2}
                  alignItems="center"
                  textAlign="center"
                  sx={(theme) => ({
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 4,
                    border: `1px solid ${alpha(
                      theme.palette.text.primary,
                      theme.palette.mode === 'dark' ? 0.24 : 0.12
                    )}`,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.9)
                        : 'rgba(255,255,255,0.88)',
                    minHeight: 320,
                  })}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'common.white',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>

                  <Box
                    sx={(theme) => ({
                      width: 76,
                      height: 76,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === 'dark' ? 0.24 : 0.12
                      ),
                    })}
                  >
                    <Icon sx={{ color: 'primary.main', fontSize: 38 }} />
                  </Box>

                  <Heading level={4}>{step.title}</Heading>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {step.description}
                  </Typography>
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Section>
  );
}
