"use client";

import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Accessibility as AccessibilityIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  IconButton,
  Tooltip,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';

import { useConfetti } from '@/lib/confetti';

interface QuizItem {
  id: string;
  item_no: number;
  stem: string;
  choices: string[];
  answer: string;
  explanation: string;
  correct: boolean | null;
}

interface QuizPlayerV2Props {
  items: QuizItem[];
  currentItemIndex: number;
  selectedAnswer: string;
  submitting: boolean;
  loading: boolean;
  error: string | null;
  showResults: boolean;
  score: number | null;
  onAnswerSelect: (answer: string) => void;
  onSubmitAnswer: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onGoHome: () => void;
  onViewCourse: () => void;
  onRetry?: () => void;
}

export default function QuizPlayerV2({
  items,
  currentItemIndex,
  selectedAnswer,
  submitting,
  loading,
  error,
  showResults,
  score,
  onAnswerSelect,
  onSubmitAnswer,
  onPrevious,
  onNext,
  onGoHome,
  onViewCourse,
  onRetry,
}: QuizPlayerV2Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const { fire: fireConfetti } = useConfetti();
  const [isMuted, setIsMuted] = useState(false);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const currentItem = items[currentItemIndex];
  const progress = ((currentItemIndex + 1) / items.length) * 100;
  const isLastQuestion = currentItemIndex === items.length - 1;
  const hasAnswered = currentItem?.correct !== null;

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (loading || submitting) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (currentItem && selectedAnswer) {
          const currentIndex = currentItem.choices.indexOf(selectedAnswer);
          const newIndex = currentIndex > 0 ? currentIndex - 1 : currentItem.choices.length - 1;
          onAnswerSelect(currentItem.choices[newIndex]);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (currentItem && selectedAnswer) {
          const currentIndex = currentItem.choices.indexOf(selectedAnswer);
          const newIndex = currentIndex < currentItem.choices.length - 1 ? currentIndex + 1 : 0;
          onAnswerSelect(currentItem.choices[newIndex]);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedAnswer && !submitting) {
          onSubmitAnswer();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (currentItemIndex > 0) {
          onPrevious();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (currentItemIndex < items.length - 1) {
          onNext();
        }
        break;
    }
  }, [currentItem, selectedAnswer, currentItemIndex, items.length, loading, submitting, onAnswerSelect, onSubmitAnswer, onPrevious, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle correct answer celebration
  useEffect(() => {
    if (hasAnswered && currentItem?.correct) {
      fireConfetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.5, y: 0.3 },
      });
      setSnackbarMessage('Correct! 🎉');
      setSnackbarOpen(true);
    }
  }, [hasAnswered, currentItem?.correct, fireConfetti]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const getScoreText = (score: number) => {
    if (score >= 0.8) return 'Excellent!';
    if (score >= 0.6) return 'Good job!';
    return 'Keep studying!';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          p: 3,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading quiz...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={onGoHome}>
          Go Home
        </Button>
      </Box>
    );
  }

  if (showResults && score !== null) {
    return (
      <Fade in={true}>
        <Box sx={{ p: 3 }}>
          <Card
            sx={{
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h4" gutterBottom>
                  Quiz Complete!
                </Typography>

                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={score * 100}
                    size={120}
                    thickness={4}
                    sx={{
                      color: theme.palette[getScoreColor(score)].main,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {Math.round(score * 100)}%
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" color={getScoreColor(score)}>
                  {getScoreText(score)}
                </Typography>

                <Typography variant="body1" color="text.secondary">
                  You answered {Math.round(score * items.length)} out of{' '}
                  {items.length} questions correctly.
                </Typography>

                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={2}
                  sx={{ width: '100%', maxWidth: 400 }}
                >
                  <Button
                    variant="outlined"
                    onClick={onGoHome}
                    fullWidth={isMobile}
                  >
                    Go Home
                  </Button>
                  <Button
                    variant="contained"
                    onClick={onViewCourse}
                    fullWidth={isMobile}
                  >
                    View Course
                  </Button>
                  {onRetry && (
                    <Button
                      variant="outlined"
                      onClick={onRetry}
                      fullWidth={isMobile}
                    >
                      Try Again
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Progress header */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">
              Question {currentItemIndex + 1} of {items.length}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Accessibility options">
                <IconButton
                  size="small"
                  onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
                  sx={{ color: 'white' }}
                >
                  <AccessibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                <IconButton
                  size="small"
                  onClick={() => setIsMuted(!isMuted)}
                  sx={{ color: 'white' }}
                >
                  {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: 'white',
                },
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {Math.round(progress)}% complete
          </Typography>
        </CardContent>
      </Card>

      {/* Accessibility menu */}
      <Slide direction="down" in={showAccessibilityMenu}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Keyboard Shortcuts
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                ↑↓ Arrow keys: Navigate choices
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ←→ Arrow keys: Previous/Next question
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter: Submit answer
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Slide>

      {/* Question card */}
      {currentItem && (
        <Card
          sx={{
            mb: 3,
            border: hasAnswered
              ? `2px solid ${currentItem.correct ? theme.palette.success.main : theme.palette.error.main}`
              : undefined,
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                lineHeight: 1.4,
                mb: 3,
              }}
            >
              {currentItem.stem}
            </Typography>

            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => onAnswerSelect(e.target.value)}
              sx={{ mb: 2 }}
            >
              {currentItem.choices.map((choice, index) => (
                <FormControlLabel
                  key={index}
                  value={choice}
                  control={<Radio />}
                  label={choice}
                  disabled={submitting || hasAnswered}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: selectedAnswer === choice
                      ? theme.palette.primary.light + '20'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-disabled': {
                      opacity: 1,
                    },
                  }}
                />
              ))}
            </RadioGroup>

            {/* Show result if answered */}
            {hasAnswered && (
              <Fade in={true}>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: currentItem.correct
                      ? theme.palette.success.light + '20'
                      : theme.palette.error.light + '20',
                    border: `1px solid ${currentItem.correct
                      ? theme.palette.success.main
                      : theme.palette.error.main}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    {currentItem.correct ? (
                      <CorrectIcon color="success" />
                    ) : (
                      <IncorrectIcon color="error" />
                    )}
                    <Typography
                      variant="subtitle1"
                      color={currentItem.correct ? 'success.main' : 'error.main'}
                      fontWeight={600}
                    >
                      {currentItem.correct ? 'Correct!' : 'Incorrect'}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {currentItem.explanation}
                  </Typography>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 8, md: 0 } }}
      >
        <Button
          variant="outlined"
          startIcon={<PrevIcon />}
          disabled={currentItemIndex === 0 || submitting}
          onClick={onPrevious}
          sx={{ minWidth: 120 }}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          endIcon={isLastQuestion ? null : <NextIcon />}
          disabled={!selectedAnswer || submitting}
          onClick={onSubmitAnswer}
          sx={{ minWidth: 120 }}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : isLastQuestion ? (
            'Finish Quiz'
          ) : (
            'Next Question'
          )}
        </Button>
      </Stack>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
