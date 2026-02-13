"use client";

import { Box, Typography, Link, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';

import { Heading } from './ui/Heading';
import { Section } from './ui/Section';

const LEARN_LINKS = [
  { label: 'Practice Tests', href: '/practice' },
  { label: 'Courses', href: '/courses' },
  { label: 'Final Exam', href: '/exam' },
];

const COMPANY_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
];

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        background:
          'linear-gradient(165deg, rgba(12,46,79,0.96) 0%, rgba(15,110,207,0.92) 56%, rgba(18,134,111,0.92) 100%)',
        color: 'common.white',
      }}
    >
      <Section spacing="lg">
        <Grid container spacing={{ xs: 4, md: 2 }}>
          <Grid xs={12} md={6}>
            <Heading level={3} sx={{ color: 'common.white', mb: 1.2 }}>
              Permit School
            </Heading>
            <Typography sx={{ color: 'rgba(255,255,255,0.88)', maxWidth: 480, lineHeight: 1.65 }}>
              Focused California permit preparation with practical lessons, adaptive practice, and clear
              progress tracking for students and families.
            </Typography>
          </Grid>

          <Grid xs={6} md={3}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Learn
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 1 }}>
              {LEARN_LINKS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  color="inherit"
                  underline="hover"
                  sx={{ width: 'fit-content' }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid xs={6} md={3}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Legal
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 1 }}>
              {COMPANY_LINKS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  color="inherit"
                  underline="hover"
                  sx={{ width: 'fit-content' }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.22)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © {new Date().getFullYear()} Permit School. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
            Not affiliated with the California DMV.
          </Typography>
        </Box>
      </Section>
    </Box>
  );
}
