import { Box, Typography, Stack, Paper, Container } from '@mui/material';
const stats = [
  { label: 'Questions', value: '500+', description: 'Real DMV questions' },
  { label: 'Pass Rate', value: '94%', description: 'Average success rate' },
  { label: 'Avg Session', value: '15 min', description: 'Quick study sessions' },
];

export function StatsStrip() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-around">
          {stats.map((stat) => (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                flex: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {stat.value}
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                {stat.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.description}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
