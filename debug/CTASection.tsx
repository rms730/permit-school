import { Box, Typography, Button, Container } from '@mui/material';

export function CTASection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Ready to ace your permit test?
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/practice"
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            Start free practice test
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
