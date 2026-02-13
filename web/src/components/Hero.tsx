"use client";

import { CheckCircle, TrendingUp } from '@mui/icons-material';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Button } from './Button';
import { Heading } from './ui/Heading';
import { Section } from './ui/Section';

const HERO_BADGES = ['DMV-style questions', 'Instant explanations', 'Mobile-friendly'];

export function Hero() {
  const t = useTranslations('Home');

  return (
    <Box
      component="section"
      id="section-hero"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(140deg, #0e365e 0%, #0f6ecf 52%, #17866f 100%)',
        color: 'common.white',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 15% 18%, rgba(255,255,255,0.2) 0, transparent 28%), radial-gradient(circle at 86% 72%, rgba(195,245,228,0.2) 0, transparent 36%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Section spacing="xl">
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
            alignItems: 'center',
            gap: { xs: 5, md: 7 },
          }}
        >
          <Stack spacing={3.5}>
            <Heading
              level={1}
              sx={{
                maxWidth: 720,
                color: 'common.white',
                textWrap: 'balance',
              }}
            >
              {t('hero.title')}
            </Heading>

            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 680,
                lineHeight: 1.45,
                textWrap: 'pretty',
              }}
            >
              {t('hero.subtitle')}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="primary"
                size="lg"
                href="/practice"
                data-cta="hero-start-free"
                data-testid="hero-start-free"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#0f4b86',
                  '&:hover': {
                    backgroundColor: '#ecf4ff',
                  },
                }}
              >
                {t('hero.primaryCta')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="#how-it-works"
                data-cta="hero-see-how"
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: 'common.white',
                  '&:hover': {
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  },
                }}
              >
                {t('hero.secondaryCta')}
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {HERO_BADGES.map(label => (
                  <Chip
                    key={label}
                    icon={<CheckCircle />}
                    label={label}
                    sx={{
                      color: 'common.white',
                      backgroundColor: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-icon': {
                        color: '#b9f2de',
                      },
                    }}
                  />
                ))}
              </Stack>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                {t('trust.badge')}
              </Typography>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: '1fr' },
            }}
          >
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.28)',
                background: 'rgba(255,255,255,0.16)',
                boxShadow: '0 16px 48px rgba(7, 34, 65, 0.3)',
              }}
            >
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                Smart Practice Loop
              </Typography>
              <Heading level={4} sx={{ mt: 0.7, color: 'common.white' }}>
                Daily Readiness Score
              </Heading>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="h3" sx={{ color: 'common.white', fontWeight: 700 }}>
                  92%
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label="+12 this week"
                  sx={{
                    color: '#0f4b86',
                    backgroundColor: '#d5f4e9',
                    '& .MuiChip-icon': { color: '#17866f' },
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(255,255,255,0.85)' }}>
                Tracks timing, topic confidence, and repeat misses so your next session starts where it matters.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.22)',
                background: 'rgba(8, 34, 59, 0.36)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', mb: 1 }}>
                Next milestone
              </Typography>
              <Typography variant="h6" sx={{ color: 'common.white', mb: 0.8 }}>
                Complete 15 mixed questions today
              </Typography>
              <Typography variant="body2" sx={{ color: '#b8dff7' }}>
                Unlocks personalized review deck for right-of-way and parking law.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Section>
    </Box>
  );
}
