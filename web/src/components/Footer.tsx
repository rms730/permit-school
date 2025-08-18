"use client";

import { Box, Typography, Grid, Link, useTheme } from '@mui/material';
import { Container } from './Container';

const footerLinks = {
  product: [
    { name: 'Practice Tests', href: '/practice' },
    { name: 'Courses', href: '/courses' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'For Schools', href: '/schools' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
  ],
};

export function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: 'grey.900',
        color: 'white',
      }}
    >
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Permit School
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              Interactive practice tests and bite-sized lessons built from official driver handbooks. 
              Pass your permit test faster with confidence.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Product
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.product.map((link) => (
                <Box component="li" key={link.name} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: 'grey.300',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Support
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.support.map((link) => (
                <Box component="li" key={link.name} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: 'grey.300',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.company.map((link) => (
                <Box component="li" key={link.name} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: 'grey.300',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Connect
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Follow us for updates and tips
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid',
            borderColor: 'grey.800',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Permit School. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
