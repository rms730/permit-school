import { Box, Typography, Button, useTheme } from '@mui/material';
import { Container } from './Container';
import SchoolIcon from '@mui/icons-material/School';

export function CtaBanner() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="cta-heading"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container>
        <Typography
          id="cta-heading"
          variant="h2"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: 'white',
          }}
        >
          Ready to ace your permit?
        </Typography>
        
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Start your free practice test today and join thousands of successful drivers
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            href="/practice"
            variant="contained"
            size="large"
            startIcon={<SchoolIcon />}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Start Free Practice Test
          </Button>
          
          <Button
            href="/signup"
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Create Account
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 4,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          No credit card required • Start studying in seconds
        </Typography>
      </Container>
    </Box>
  );
}
