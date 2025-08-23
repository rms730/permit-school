"use client";

import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import {
  Container,
  Box,
  Typography,
  Link,
  IconButton,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';

export function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Permit School
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your trusted partner in driver education. We help you prepare for your permit test with confidence.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Learn
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/courses" color="inherit" underline="hover">
                  Courses
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/practice" color="inherit" underline="hover">
                  Practice Tests
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/exam" color="inherit" underline="hover">
                  Final Exam
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/help" color="inherit" underline="hover">
                  Help Center
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/contact" color="inherit" underline="hover">
                  Contact Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/faq" color="inherit" underline="hover">
                  FAQ
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/about" color="inherit" underline="hover">
                  About Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/careers" color="inherit" underline="hover">
                  Careers
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/press" color="inherit" underline="hover">
                  Press
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid
            xs={12}
            md={2}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/privacy" color="inherit" underline="hover">
                  Privacy Policy
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/terms" color="inherit" underline="hover">
                  Terms of Service
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/accessibility" color="inherit" underline="hover">
                  Accessibility
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ borderTop: 1, borderColor: 'rgba(255,255,255,0.1)', pt: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Permit School. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
