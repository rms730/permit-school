"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

interface ReadingProgressProps {
  currentSection: number;
  totalSections: number;
  timeSpent?: number; // in seconds
  estimatedTimeRemaining?: number; // in seconds
  isVisible?: boolean;
  onSectionChange?: (section: number) => void;
  showTimeInfo?: boolean;
  showSectionInfo?: boolean;
}

export default function ReadingProgress({
  currentSection,
  totalSections,
  timeSpent = 0,
  estimatedTimeRemaining = 0,
  isVisible = true,
  onSectionChange,
  showTimeInfo = true,
  showSectionInfo = true,
}: ReadingProgressProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  // Calculate progress percentage
  useEffect(() => {
    const percentage = totalSections > 0 ? (currentSection / totalSections) * 100 : 0;
    setProgress(Math.min(percentage, 100));
  }, [currentSection, totalSections]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle section click
  const handleSectionClick = (section: number) => {
    if (onSectionChange && section >= 1 && section <= totalSections) {
      onSectionChange(section);
    }
  };

  return (
    <Fade in={isVisible}>
      <Box
        ref={progressRef}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: { xs: 1.5, md: 2 },
        }}
      >
        {/* Progress bar */}
        <Box sx={{ mb: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              },
            }}
          />
        </Box>

        {/* Progress info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {/* Section info */}
          {showSectionInfo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityIcon
                sx={{
                  fontSize: 16,
                  color: theme.palette.text.secondary,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                Section {currentSection} of {totalSections}
              </Typography>
              <Chip
                label={`${Math.round(progress)}%`}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          )}

          {/* Time info */}
          {showTimeInfo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon
                sx={{
                  fontSize: 16,
                  color: theme.palette.text.secondary,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                {formatTime(timeSpent)}
                {estimatedTimeRemaining > 0 && (
                  <span style={{ marginLeft: 8 }}>
                    • ~{formatTime(estimatedTimeRemaining)} left
                  </span>
                )}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Section navigation (mobile only) */}
        {isMobile && showSectionInfo && (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              mt: 1,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': {
                height: 4,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: theme.palette.grey[100],
                borderRadius: 2,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.grey[300],
                borderRadius: 2,
              },
            }}
          >
            {Array.from({ length: totalSections }, (_, index) => {
              const sectionNumber = index + 1;
              const isActive = sectionNumber === currentSection;
              const isCompleted = sectionNumber < currentSection;
              
              return (
                <Box
                  key={sectionNumber}
                  onClick={() => handleSectionClick(sectionNumber)}
                  sx={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: isActive
                      ? theme.palette.primary.main
                      : isCompleted
                      ? theme.palette.success.light
                      : theme.palette.grey[200],
                    color: isActive
                      ? theme.palette.primary.contrastText
                      : isCompleted
                      ? theme.palette.success.contrastText
                      : theme.palette.text.secondary,
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isActive
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                    },
                  }}
                >
                  {sectionNumber}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Fade>
  );
}
