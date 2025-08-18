"use client";

import { Box, Typography, Stack, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Button } from './Button';
import { Container } from './Container';
import SchoolIcon from '@mui/icons-material/School';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export function Hero() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 8 },
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              id="hero-heading"
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 700,
                lineHeight: 1.1,
                mb: 3,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Pass your permit faster.
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Interactive practice tests and bite‑sized lessons built from official handbooks. 
              Learn on your phone, track progress anywhere.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Button
                href="/practice"
                variant="primary"
                size="large"
                startIcon={<SchoolIcon />}
                sx={{ minWidth: 200 }}
              >
                Start Free Practice Test
              </Button>
              <Button
                href="#how-it-works"
                variant="secondary"
                size="large"
                startIcon={<TrendingUpIcon />}
              >
                See How It Works
              </Button>
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<SmartphoneIcon />}
                label="Mobile‑first"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<SchoolIcon />}
                label="Real‑world explanations"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<TrendingUpIcon />}
                label="Progress tracking"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: { xs: 300, md: 400 },
              position: 'relative',
            }}
          >
            {/* Hero illustration placeholder */}
            <Box
              sx={{
                width: '100%',
                maxWidth: 500,
                height: 400,
                background: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 188, 212, 0.2)',
              }}
            >
                              <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: 60,
                    height: 60,
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '30%',
                    right: '15%',
                    width: 40,
                    height: 40,
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '50%',
                  }}
                />
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  textAlign: 'center',
                  px: 3,
                }}
              >
                📱 Practice Test
                <br />
                📚 Study Lessons
                <br />
                📊 Track Progress
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>


    </Box>
  );
}
