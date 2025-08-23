import {
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,

  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import React from 'react';

interface ScoreReportPageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

// This would normally fetch data from the API
async function getScoreReport(attemptId: string) {
  // Mock data - replace with actual API call
  return {
    attempt: {
      id: attemptId,
      completed_at: '2025-01-18T15:30:00Z',
      test_name: 'ACT',
      scaled_score: 28,
      total_questions: 80,
      correct_answers: 65,
    },
    sections: [
      {
        name: 'English',
        scaled_score: 30,
        raw_score: 16,
        total_questions: 20,
        time_spent_sec: 2580,
        time_limit_sec: 2700,
        accuracy: 0.8,
      },
      {
        name: 'Mathematics',
        scaled_score: 26,
        raw_score: 14,
        total_questions: 20,
        time_spent_sec: 3480,
        time_limit_sec: 3600,
        accuracy: 0.7,
      },
      {
        name: 'Reading',
        scaled_score: 29,
        raw_score: 17,
        total_questions: 20,
        time_spent_sec: 1980,
        time_limit_sec: 2100,
        accuracy: 0.85,
      },
      {
        name: 'Science',
        scaled_score: 27,
        raw_score: 18,
        total_questions: 20,
        time_spent_sec: 1890,
        time_limit_sec: 2100,
        accuracy: 0.9,
      },
    ],
    skillAnalysis: [
      { skill: 'Grammar & Usage', accuracy: 0.85, questions: 12 },
      { skill: 'Reading Comprehension', accuracy: 0.8, questions: 15 },
      { skill: 'Algebra', accuracy: 0.7, questions: 10 },
      { skill: 'Geometry', accuracy: 0.65, questions: 8 },
      { skill: 'Data Analysis', accuracy: 0.9, questions: 10 },
    ],
    recommendations: [
      'Focus on Geometry concepts, especially coordinate geometry and trigonometry',
      'Practice more Algebra word problems to improve speed and accuracy',
      'Continue strong performance in Data Analysis with more complex problems',
      'Grammar skills are solid - maintain with regular practice',
    ],
  };
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getScoreColor(score: number, testType: 'ACT' | 'SAT' = 'ACT'): string {
  if (testType === 'ACT') {
    if (score >= 30) return '#10b981'; // green
    if (score >= 25) return '#f59e0b'; // yellow
    if (score >= 20) return '#f97316'; // orange
    return '#ef4444'; // red
  } else {
    // SAT scoring
    if (score >= 1400) return '#10b981';
    if (score >= 1200) return '#f59e0b';
    if (score >= 1000) return '#f97316';
    return '#ef4444';
  }
}

export default async function ScoreReportPage({ params }: ScoreReportPageProps) {
  const { attemptId } = await params;
  const scoreReport = await getScoreReport(attemptId);
  const { attempt, sections, skillAnalysis, recommendations } = scoreReport;

  const testDate = new Date(attempt.completed_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const overallAccuracy = (attempt.correct_answers / attempt.total_questions) * 100;
  const scoreColor = getScoreColor(attempt.scaled_score, attempt.test_name as 'ACT' | 'SAT');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          {attempt.test_name} Score Report
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test completed on {testDate}
        </Typography>
      </Box>
      {/* Overall Score Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid xs={12} md={6}>
              <Typography variant="h2" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {attempt.scaled_score}
                <Typography component="span" variant="h4" sx={{ opacity: 0.8, ml: 1 }}>
                  / {attempt.test_name === 'ACT' ? '36' : '1600'}
                </Typography>
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Composite Score
              </Typography>
              <Chip
                label={`${Math.round(overallAccuracy)}% Overall Accuracy`}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    mr: 2,
                    mb: { xs: 2, md: 0 },
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Download PDF
                </Button>
                <Button
                  component={Link}
                  href="/prep/mock"
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Retake Test
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid container spacing={4}>
        {/* Section Scores */}
        <Grid xs={12} md={8}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Section Breakdown
              </Typography>
              {sections.map((section, index) => (
                <Box key={section.name} sx={{ mb: index < sections.length - 1 ? 3 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="h3">
                      {section.name}
                    </Typography>
                    <Chip
                      label={section.scaled_score}
                      sx={{
                        backgroundColor: getScoreColor(section.scaled_score),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Accuracy
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {Math.round(section.accuracy * 100)}%
                      </Typography>
                    </Grid>
                    <Grid xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Questions
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {section.raw_score}/{section.total_questions}
                      </Typography>
                    </Grid>
                    <Grid xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Time Used
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatTime(section.time_spent_sec)} / {formatTime(section.time_limit_sec)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <LinearProgress
                    variant="determinate"
                    value={section.accuracy * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(section.scaled_score),
                      },
                    }}
                  />
                  {index < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Skill Analysis */}
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Skill Analysis
              </Typography>
              {skillAnalysis.map((skill, index) => (
                <Box key={skill.skill} sx={{ mb: index < skillAnalysis.length - 1 ? 3 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {skill.skill}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(skill.accuracy * 100)}% ({skill.questions} questions)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={skill.accuracy * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: skill.accuracy >= 0.8 ? '#10b981' : skill.accuracy >= 0.6 ? '#f59e0b' : '#ef4444',
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations & Actions */}
        <Grid xs={12} md={4}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                Score Interpretation
              </Typography>
              <Alert
                severity={attempt.scaled_score >= 30 ? 'success' : attempt.scaled_score >= 25 ? 'info' : 'warning'}
                sx={{ mb: 2 }}
              >
                {attempt.scaled_score >= 30 && 'Excellent! This score is competitive for top-tier colleges.'}
                {attempt.scaled_score >= 25 && attempt.scaled_score < 30 && 'Good score! You\'re in a strong position for many colleges.'}
                {attempt.scaled_score < 25 && 'There\'s room for improvement. Focus on your weaker areas.'}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Your {attempt.test_name} composite score of {attempt.scaled_score} places you in approximately the{' '}
                {attempt.scaled_score >= 30 ? '93rd' : attempt.scaled_score >= 25 ? '75th' : '50th'} percentile of test takers.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1, color: '#3b82f6' }} />
                Recommendations
              </Typography>
              <List dense>
                {recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { lineHeight: 1.5 },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                Next Steps
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  component={Link}
                  href="/prep/diagnostic"
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUpIcon />}
                >
                  Take Diagnostic Test
                </Button>
                <Button
                  component={Link}
                  href="/prep/mock"
                  variant="contained"
                  fullWidth
                  startIcon={<RefreshIcon />}
                  sx={{
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                  }}
                >
                  Practice More
                </Button>
                <Button
                  component={Link}
                  href="/signup"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#f59e0b',
                    '&:hover': {
                      backgroundColor: '#d97706',
                    },
                  }}
                >
                  Get Study Plan
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export async function generateMetadata({ params }: ScoreReportPageProps) {
  const { attemptId } = await params;
  return {
    title: `Score Report - ${attemptId} | College Test Prep | Permit School`,
    description: 'View your detailed test score report with section breakdowns, skill analysis, and personalized recommendations.',
  };
}
