import { Accessibility } from '@mui/icons-material';
import {
  Container,
  Box,
  Stack,
  Typography,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import * as React from 'react';

const footerLinks = {
  product: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Practice tests', href: '#practice-tests' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
};

export function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'grey.900',
        color: 'white',
        py: { xs: 6, md: 8 },
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6}>
          {/* Main footer content */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 8 }}
            justifyContent="space-between"
          >
            {/* Brand section */}
            <Box sx={{ maxWidth: 300 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Permit School
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.400',
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                Helping new drivers pass their permit test with confidence through smart practice and personalized learning.
              </Typography>
              
              {/* Accessibility badge */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 12px',
                  borderRadius: 2,
                  width: 'fit-content',
                }}
              >
                <Accessibility sx={{ fontSize: 20, color: '#22c55e' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'grey.300',
                  }}
                >
                  Built with accessibility in mind
                </Typography>
              </Stack>
            </Box>

            {/* Links sections */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 4, sm: 6, md: 8 }}
            >
              {Object.entries(footerLinks).map(([category, links]) => (
                <Box key={category}>
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      textTransform: 'capitalize',
                    }}
                  >
                    {category}
                  </Typography>
                  <Stack spacing={1}>
                    {links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        variant="body2"
                        sx={{
                          color: 'grey.400',
                          textDecoration: 'none',
                          '&:hover': {
                            color: 'white',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>

          {/* Bottom section */}
          <Box
            sx={{
              borderTop: '1px solid',
              borderColor: 'grey.800',
              pt: 4,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 4 }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.400',
                }}
              >
                © 2024 Permit School. All rights reserved.
              </Typography>
              
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
              >
                <Link
                  href="/privacy"
                  variant="body2"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  variant="body2"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Terms
                </Link>
                <Link
                  href="/accessibility"
                  variant="body2"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Accessibility
                </Link>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
