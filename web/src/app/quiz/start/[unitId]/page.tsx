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
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { getEntitlementForUserClient } from "@/lib/entitlementsClient";
import Link from "next/link";
import AppBar from "@/components/AppBar";

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
  const [unit, setUnit] = useState<any>(null);
  const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
  const [checkingEntitlement, setCheckingEntitlement] = useState(true);

  const supabase = createPagesBrowserClient();

  useEffect(() => {
    async function checkAccess() {
      try {
        // Get unit details
        const { data: unitData, error: unitError } = await supabase
          .from("course_units")
          .select("id, title, unit_no, minutes_required")
          .eq("id", unitId)
          .single();

        if (unitError || !unitData) {
          setError("Unit not found");
          setCheckingEntitlement(false);
          return;
        }

        setUnit(unitData);

        // Check entitlement for units beyond Unit 1
        if (unitData.unit_no !== 1) {
          const { active } = await getEntitlementForUserClient('CA');
          setIsEntitled(active);
          
          if (!active) {
            setCheckingEntitlement(false);
            return;
          }
        } else {
          setIsEntitled(true);
        }

        setCheckingEntitlement(false);
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Failed to check access');
        setCheckingEntitlement(false);
      }
    }

    checkAccess();
  }, [unitId, supabase]);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "NOT_ENOUGH_TIME") {
          setError(
            `You need ${data.required} minutes of study time. You have ${data.accrued} minutes. Please continue studying the lesson.`,
          );
        } else {
          setError(data.error || "Failed to start quiz");
        }
        return;
      }

      // Redirect to quiz
      router.push(`/quiz/${data.attemptId}`);
    } catch (err) {
      console.error("Quiz start error:", err);
      setError("Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  if (checkingEntitlement) {
    return (
      <>
        <AppBar title="Quiz Start" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <CircularProgress />
              <Typography>Checking access...</Typography>
            </Stack>
          </Paper>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppBar title="Quiz Start" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  if (unit && unit.unit_no !== 1 && !isEntitled) {
    return (
      <>
        <AppBar title="Quiz Start" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Alert 
              severity="info" 
              action={
                <Button color="inherit" size="small" component={Link} href="/billing">
                  Upgrade
                </Button>
              }
            >
              This quiz requires a subscription. Please upgrade to access all course content.
            </Alert>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar title={`${unit?.title || 'Quiz'} - Start`} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" gutterBottom>
              Start Quiz
            </Typography>

            <Typography variant="body1" textAlign="center">
              This quiz will test your knowledge of the lesson material. Make sure
              you have completed the required study time before starting.
            </Typography>

            {unit && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Unit {unit.unit_no}: {unit.title}
              </Typography>
            )}

            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                component={Link}
                href={`/learn/${unitId}`}
                disabled={loading}
              >
                Review Lesson
              </Button>
              <Button
                variant="contained"
                onClick={startQuiz}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Starting..." : "Start Quiz"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
