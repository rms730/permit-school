import { Grid, Card, CardContent, Stack, Typography, Box } from '@mui/material';
import { Container } from './Container';
import QuizIcon from '@mui/icons-material/Quiz';
import BoltIcon from '@mui/icons-material/Bolt';
import InsightsIcon from '@mui/icons-material/Insights';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import TimerIcon from '@mui/icons-material/Timer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const items = [
  { icon: <QuizIcon />, title: 'Realistic questions', body: 'Written with the latest handbook in mind and mapped to exam topics.' },
  { icon: <BoltIcon />, title: 'Adaptive practice', body: 'Focus time where it matters most with auto‑generated drills.' },
  { icon: <InsightsIcon />, title: 'Progress insights', body: 'Know when you&apos;re truly ready with readiness scores.' },
  { icon: <OndemandVideoIcon />, title: 'Micro‑lessons', body: 'Short explainers that make rules and signs easy to remember.' },
  { icon: <TimerIcon />, title: 'Exam simulator', body: 'Timed mock tests with instant feedback and review.' },
  { icon: <SupportAgentIcon />, title: 'Parent tools', body: 'Simple oversight and sign‑off—no nagging required.' },
];

export function FeatureGrid() {
  return (
    <Box
      component="section"
      id="section-features"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Why Permit School?
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Modern learning designed for today&apos;s drivers
          </Typography>
        </Box>

        <Grid container spacing={3} id="features">
          {items.map((item) => (
            <Grid key={item.title} item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {item.icon}
                      <Typography variant="h6" fontWeight={700}>{item.title}</Typography>
                    </Stack>
                    <Typography color="text.secondary">{item.body}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
