"use client";

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  MenuBook as BookIcon,
  Timer as TimerIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import Link from 'next/link';

interface ResumeHelperProps {
  lastUnit?: {
    id: string;
    title: string;
    unit_no: number;
    progress: number;
  };
  lastQuiz?: {
    id: string;
    title: string;
    score?: number;
    completed: boolean;
  };
  totalProgress?: number;
  timeSpentToday?: number; // in minutes
  onResumeUnit?: () => void;
  onStartQuiz?: () => void;
  onViewProgress?: () => void;
}

export default function ResumeHelper({
  lastUnit,
  lastQuiz,
  totalProgress = 0,
  timeSpentToday = 0,
  onResumeUnit,
  onStartQuiz,
  onViewProgress,
}: ResumeHelperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 60) return 'warning';
    return 'primary';
  };

  if (!lastUnit && !lastQuiz) {
    return null;
  }

  return (
    <Fade in={true}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: 'white',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight={600}>
                Continue Learning
              </Typography>
              <Chip
                label={`${Math.round(totalProgress)}% complete`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Stack>

            {/* Progress stats */}
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={2}
              alignItems={isMobile ? 'stretch' : 'center'}
            >
              {timeSpentToday > 0 && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    p: 1,
                    borderRadius: 1,
                    flex: 1,
                  }}
                >
                  <TimerIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    {formatTime(timeSpentToday)} today
                  </Typography>
                </Stack>
              )}

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  p: 1,
                  borderRadius: 1,
                  flex: 1,
                }}
              >
                <ProgressIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  {Math.round(totalProgress)}% overall progress
                </Typography>
              </Stack>
            </Stack>

            {/* Resume options */}
            <Stack spacing={2}>
              {lastUnit && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BookIcon sx={{ fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {lastUnit.title}
                      </Typography>
                    </Stack>
                    <Chip
                      label={`Unit ${lastUnit.unit_no}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }}
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {Math.round(lastUnit.progress)}% complete
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      onClick={onResumeUnit}
                      component={Link}
                      href={`/learn/${lastUnit.id}`}
                      sx={{
                        backgroundColor: 'white',
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                        fontWeight: 600,
                      }}
                    >
                      Resume
                    </Button>
                  </Stack>
                </Box>
              )}

              {lastQuiz && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {lastQuiz.title}
                    </Typography>
                    {lastQuiz.score !== undefined && (
                      <Chip
                        label={`${Math.round(lastQuiz.score * 100)}%`}
                        size="small"
                        color={getProgressColor(lastQuiz.score * 100) as any}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                        }}
                      />
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {lastQuiz.completed ? 'Quiz completed' : 'Quiz in progress'}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={onStartQuiz}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        fontWeight: 600,
                      }}
                    >
                      {lastQuiz.completed ? 'Review' : 'Continue'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>

            {/* View progress button */}
            {onViewProgress && (
              <Button
                variant="text"
                onClick={onViewProgress}
                sx={{
                  color: 'white',
                  textDecoration: 'underline',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                View full progress →
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}
