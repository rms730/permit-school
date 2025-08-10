'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Paper, Typography, Button, Stack, Alert, CircularProgress
} from '@mui/material';

interface PageProps {
  params: {
    unitId: string;
  };
}

export default function QuizStartPage({ params }: PageProps) {
  const { unitId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'NOT_ENOUGH_TIME') {
          setError(`You need ${data.required} minutes of study time. You have ${data.accrued} minutes. Please continue studying the lesson.`);
        } else {
          setError(data.error || 'Failed to start quiz');
        }
        return;
      }

      // Redirect to quiz
      router.push(`/quiz/${data.attemptId}`);
    } catch (err) {
      console.error('Quiz start error:', err);
      setError('Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" gutterBottom>
            Start Quiz
          </Typography>

          <Typography variant="body1" textAlign="center">
            This quiz will test your knowledge of the lesson material. 
            Make sure you have completed the required study time before starting.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              disabled={loading}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              onClick={startQuiz}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Starting...' : 'Start Quiz'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
