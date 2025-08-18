"use client";

import { Box, Typography, Grid, Link, Container, Stack } from '@mui/material';

const footerLinks = {
  product: [
    { name: 'Practice Tests', href: '/practice' },
    { name: 'Features', href: '#features' },
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
  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Permit School
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Modern permit test preparation for today&apos;s drivers.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Permit School is an independent learning platform and is not affiliated with any Department of Motor Vehicles.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Product
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.product.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      color="text.secondary"
                      underline="hover"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Support
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.support.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      color="text.secondary"
                      underline="hover"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Company
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.company.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      color="text.secondary"
                      underline="hover"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Permit School. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
