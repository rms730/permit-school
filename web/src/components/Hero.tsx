"use client";

import { CheckCircle } from '@mui/icons-material';
import {
  Container,
  Box,
  Stack,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Button } from './Button';

export function Hero() {
  const t = useTranslations('Home');
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      id="section-hero"
      sx={{
        background: 'linear-gradient(135deg, #0b1220 0%, #1e293b 50%, #334155 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 6, md: 8 },
            alignItems: 'center',
            minHeight: { xs: 'auto', md: '80vh' },
          }}
        >
          {/* Left Column - Content */}
          <Stack spacing={4}>
            <Stack spacing={3}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.75rem', md: '3.5rem' },
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('hero.title')}
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.5,
                  maxWidth: 600,
                }}
              >
                {t('hero.subtitle')}
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="primary"
                size="lg"
                href="/practice"
                data-cta="hero-start-free"
                data-testid="hero-start-free"
                sx={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
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
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {t('hero.secondaryCta')}
              </Button>
            </Stack>

            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<CheckCircle />}
                  label="DMV-style questions"
                  sx={{
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Instant explanations"
                  sx={{
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Mobile-friendly"
                  sx={{
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                />
              </Stack>
              
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                }}
              >
                {t('trust.badge')}
              </Typography>
              
              <Typography
                component="a"
                href="/handbook"
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textDecoration: 'underline',
                  '&:hover': {
                    color: 'white',
                  },
                }}
              >
                Aligned with 2025 DMV handbook
              </Typography>
            </Stack>
          </Stack>

          {/* Right Column - Product Visual */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 500,
                height: { xs: 300, md: 400 },
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Stack spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h4" component="span" sx={{ color: 'white', fontWeight: 700 }}>
                    ✓
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Interactive Practice Platform
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center',
                    maxWidth: 300,
                  }}
                >
                  Real DMV-style questions with instant feedback and progress tracking
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
