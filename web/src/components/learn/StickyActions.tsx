"use client";

import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from '@mui/material';
interface StickyActionsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onPlayPause?: () => void;
  onVolumeToggle?: () => void;
  onFullscreen?: () => void;
  isPlaying?: boolean;
  isMuted?: boolean;
  hasPrevious?: boolean;
  hasNext?: boolean;
  showPlayControls?: boolean;
  showVolumeControls?: boolean;
  showFullscreen?: boolean;
  className?: string;
}

export default function StickyActions({
  onPrevious,
  onNext,
  onPlayPause,
  onVolumeToggle,
  onFullscreen,
  isPlaying = false,
  isMuted = false,
  hasPrevious = false,
  hasNext = false,
  showPlayControls = false,
  showVolumeControls = false,
  showFullscreen = false,
  className,
}: StickyActionsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Box
        className={className}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            {/* Left side - Navigation */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<PrevIcon />}
                onClick={onPrevious}
                disabled={!hasPrevious || !onPrevious}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {isMobile ? 'Prev' : 'Previous'}
              </Button>

              <Button
                variant="outlined"
                endIcon={<NextIcon />}
                onClick={onNext}
                disabled={!hasNext || !onNext}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {isMobile ? 'Next' : 'Next'}
              </Button>
            </Stack>

            {/* Center - Play controls */}
            {showPlayControls && (
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={onPlayPause}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    width: 48,
                    height: 48,
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Stack>
            )}

            {/* Right side - Utility controls */}
            <Stack direction="row" spacing={1}>
              {showVolumeControls && (
                <IconButton
                  onClick={onVolumeToggle}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
                </IconButton>
              )}

              {showFullscreen && (
                <IconButton
                  onClick={onFullscreen}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  aria-label="Fullscreen"
                >
                  <FullscreenIcon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Slide>
  );
}
