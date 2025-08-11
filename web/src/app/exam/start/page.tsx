"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import AppBar from "@/components/AppBar";

export default function ExamStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startExam = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "NOT_ELIGIBLE") {
          setError(`Not eligible: ${data.reason}`);
        } else {
          setError(data.error || "Failed to start exam");
        }
        return;
      }

      // Redirect to exam
      router.push(`/exam/${data.attemptId}`);
    } catch (err) {
      console.error("Exam start error:", err);
      setError("Failed to start exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar title="Start Final Exam" />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" gutterBottom>
              Start Final Exam
            </Typography>

            <Typography variant="body1" textAlign="center">
              Are you ready to take the final exam? Make sure you have reviewed all course material.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
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
                onClick={startExam}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Starting..." : "Start Exam"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
