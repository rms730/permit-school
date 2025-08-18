import { Box, Typography, Grid, Card, CardContent, useTheme } from '@mui/material';
import { Container } from './Container';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const steps = [
  {
    icon: <AssignmentIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    step: '1',
    title: 'Take a Practice Test',
    description: 'Start with our free practice test to see where you stand. Get instant feedback on every question.',
  },
  {
    icon: <SchoolIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    step: '2',
    title: 'Study Smart Lessons',
    description: 'Focus on your weak areas with bite-sized lessons. Learn at your own pace, anywhere, anytime.',
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    step: '3',
    title: 'Pass with Confidence',
    description: 'Track your progress and take the real test with confidence. Our students pass at higher rates.',
  },
];

export function HowItWorks() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="how-it-works-heading"
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Three simple steps to get your permit
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    flexGrow: 1,
                    position: 'relative',
                  }}
                >
                  {/* Step number badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      zIndex: 1,
                    }}
                  >
                    {step.step}
                  </Box>

                  <Box sx={{ mb: 3, mt: 2 }}>{step.icon}</Box>
                  
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    {step.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Connection lines between steps */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'relative',
            mt: -4,
            mb: 4,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '33.33%',
              width: '33.33%',
              height: 2,
              backgroundColor: 'primary.main',
              opacity: 0.3,
              transform: 'translateY(-50%)',
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
