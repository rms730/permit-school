"use client";

import { WifiOff, Refresh } from "@mui/icons-material";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  AlertTitle,
} from "@mui/material";
import * as React from "react";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function OfflinePage() {
  const { dict } = useI18n();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <WifiOff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h1" component="h1" gutterBottom>
          You&apos;re Offline
        </Typography>
        <Typography variant="h2" component="h2" color="text.secondary" gutterBottom>
          No Internet Connection
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Why do I need internet?</AlertTitle>
          Permit School requires an internet connection to:
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Access course content and lessons</li>
            <li>Take practice tests and exams</li>
            <li>Track your learning progress</li>
            <li>Ensure accurate seat-time recording</li>
            <li>Maintain exam integrity and compliance</li>
          </ul>
        </Alert>

        <Typography variant="body1" paragraph>
          For security and compliance reasons, we cannot provide offline access to course materials, 
          exams, or learning activities. This ensures that:
        </Typography>

        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <Typography component="li" variant="body1" paragraph>
            Your learning progress is accurately tracked
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Exam results are valid and secure
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            We meet regulatory requirements for driver education
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Seat-time is only recorded when you&apos;re actively learning online
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          Please check your internet connection and try again when you&apos;re back online.
        </Typography>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Refresh />}
          onClick={handleRetry}
          sx={{ mb: 2 }}
        >
          Try Again
        </Button>
        <Typography variant="body2" color="text.secondary">
          This page will automatically reload when your connection is restored
        </Typography>
      </Box>
    </Container>
  );
}
