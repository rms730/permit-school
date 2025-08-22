"use client";

import {
  ArrowBack as ArrowBackIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface UnitHeaderProps {
  unit: {
    id: string;
    title: string;
    unit_no: number;
    minutes_required: number;
  };
  progress: number;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onBack?: () => void;
}

export default function UnitHeader({
  unit,
  progress,
  isBookmarked = false,
  onBookmarkToggle,
  onBack,
}: UnitHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [showProgress, setShowProgress] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          },
        }}
      />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <IconButton
            onClick={handleBack}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: theme.palette.text.primary,
              }}
            >
              {unit.title}
            </Typography>
          </Box>

          {onBookmarkToggle && (
            <IconButton
              onClick={onBookmarkToggle}
              sx={{
                color: isBookmarked ? theme.palette.primary.main : theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          <Chip
            label={`Unit ${unit.unit_no}`}
            size="small"
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
            }}
          />
          
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <span>⏱</span>
            {unit.minutes_required} min required
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <span>📊</span>
            {Math.round(progress)}% complete
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
