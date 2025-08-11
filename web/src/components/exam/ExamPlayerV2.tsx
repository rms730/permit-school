"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  QuestionMark as UnansweredIcon,
  Flag as FlagIcon,
  OutlinedFlag as OutlinedFlagIcon,
  Timer as TimerIcon,
  Visibility as ReviewIcon,
  PlayArrow as ResumeIcon,
  Pause as PauseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { useConfetti } from '@/lib/confetti';

interface ExamItem {
  id: string;
  item_no: number;
  stem: string;
  choices: string[];
  answer: string;
  explanation: string;
  correct: boolean | null;
  flagged?: boolean;
  timeSpent?: number; // in seconds
}

interface ExamPlayerV2Props {
  items: ExamItem[];
  currentItemIndex: number;
  selectedAnswer: string;
  submitting: boolean;
  loading: boolean;
  error: string | null;
  showResults: boolean;
  score: number | null;
  timeRemaining?: number; // in seconds
  isPaused?: boolean;
  isFullscreen?: boolean;
  onAnswerSelect: (answer: string) => void;
  onSubmitAnswer: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onGoHome: () => void;
  onViewCourse: () => void;
  onRetry?: () => void;
  onTogglePause?: () => void;
  onToggleFullscreen?: () => void;
  onToggleFlag?: () => void;
  onJumpToQuestion?: (index: number) => void;
}

export default function ExamPlayerV2({
  items,
  currentItemIndex,
  selectedAnswer,
  submitting,
  loading,
  error,
  showResults,
  score,
  timeRemaining,
  isPaused = false,
  isFullscreen = false,
  onAnswerSelect,
  onSubmitAnswer,
  onPrevious,
  onNext,
  onGoHome,
  onViewCourse,
  onRetry,
  onTogglePause,
  onToggleFullscreen,
  onToggleFlag,
  onJumpToQuestion,
}: ExamPlayerV2Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { fire: fireConfetti } = useConfetti();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const currentItem = items[currentItemIndex];
  const progress = ((currentItemIndex + 1) / items.length) * 100;
  const isLastQuestion = currentItemIndex === items.length - 1;
  const hasAnswered = currentItem?.correct !== null;
  const answeredCount = items.filter(item => item.correct !== null).length;
  const flaggedCount = items.filter(item => item.flagged).length;

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (loading || submitting || isPaused) return;

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
      case ' ':
        event.preventDefault();
        if (onTogglePause) {
          onTogglePause();
        }
        break;
      case 'f':
        event.preventDefault();
        if (onToggleFlag) {
          onToggleFlag();
        }
        break;
      case 'r':
        event.preventDefault();
        setShowReviewDialog(true);
        break;
    }
  }, [currentItem, selectedAnswer, currentItemIndex, items.length, loading, submitting, isPaused, onAnswerSelect, onSubmitAnswer, onPrevious, onNext, onTogglePause, onToggleFlag]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle correct answer celebration
  useEffect(() => {
    if (hasAnswered && currentItem?.correct) {
      fireConfetti({
        particleCount: 20,
        spread: 50,
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

  const getQuestionStatusIcon = (item: ExamItem) => {
    if (item.correct === true) return <CorrectIcon color="success" />;
    if (item.correct === false) return <IncorrectIcon color="error" />;
    return <UnansweredIcon color="action" />;
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
          Loading exam...
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
                  Exam Complete!
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
              {timeRemaining !== undefined && (
                <Chip
                  icon={<TimerIcon />}
                  label={formatTime(timeRemaining)}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
              <Tooltip title="Review questions">
                <IconButton
                  size="small"
                  onClick={() => setShowReviewDialog(true)}
                  sx={{ color: 'white' }}
                >
                  <ReviewIcon />
                </IconButton>
              </Tooltip>
              {onToggleFullscreen && (
                <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                  <IconButton
                    size="small"
                    onClick={onToggleFullscreen}
                    sx={{ color: 'white' }}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
              )}
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

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {Math.round(progress)}% complete • {answeredCount}/{items.length} answered
            </Typography>
            {flaggedCount > 0 && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {flaggedCount} flagged
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Pause overlay */}
      {isPaused && (
        <Fade in={true}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Exam Paused
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Press spacebar or click resume to continue
              </Typography>
              <Button
                variant="contained"
                startIcon={<ResumeIcon />}
                onClick={onTogglePause}
              >
                Resume Exam
              </Button>
            </Card>
          </Box>
        </Fade>
      )}

      {/* Question card */}
      {currentItem && (
        <Card
          sx={{
            mb: 3,
            border: hasAnswered
              ? `2px solid ${currentItem.correct ? theme.palette.success.main : theme.palette.error.main}`
              : currentItem.flagged
              ? `2px solid ${theme.palette.warning.main}`
              : undefined,
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 2 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.4,
                  flex: 1,
                }}
              >
                {currentItem.stem}
              </Typography>
              {onToggleFlag && (
                <Tooltip title={currentItem.flagged ? 'Remove flag' : 'Flag question'}>
                  <IconButton
                    onClick={onToggleFlag}
                    color={currentItem.flagged ? 'warning' : 'default'}
                    size="small"
                  >
                    {currentItem.flagged ? <FlagIcon /> : <OutlinedFlagIcon />}
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

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

        <Stack direction="row" spacing={1}>
          {onTogglePause && (
            <Button
              variant="outlined"
              startIcon={isPaused ? <ResumeIcon /> : <PauseIcon />}
              onClick={onTogglePause}
              sx={{ minWidth: 100 }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

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
              'Finish Exam'
            ) : (
              'Next Question'
            )}
          </Button>
        </Stack>
      </Stack>

      {/* Review dialog */}
      <Dialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Question Review
        </DialogTitle>
        <DialogContent>
          <List>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      if (onJumpToQuestion) {
                        onJumpToQuestion(index);
                      }
                      setShowReviewDialog(false);
                    }}
                    selected={index === currentItemIndex}
                  >
                    <ListItemIcon>
                      {getQuestionStatusIcon(item)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Question ${index + 1}`}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {item.flagged && <FlagIcon color="warning" fontSize="small" />}
                          {item.timeSpent && (
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(item.timeSpent)}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
