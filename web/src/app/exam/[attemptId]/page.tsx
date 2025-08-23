"use client";

import {
  Container,
  Paper,
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
  Box,
  Chip,
} from "@mui/material";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState, useEffect } from "react";

import AppBar from "@/components/AppBar";

interface QuizItem {
  id: string;
  item_no: number;
  stem: string;
  choices: string[];
  answer: string;
  explanation: string;
  correct: boolean | null;
}

interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default function ExamPage({ params }: PageProps) {
  const [attemptId, setAttemptId] = useState<string>("");
  
  useEffect(() => {
    params.then(({ attemptId }) => setAttemptId(attemptId));
  }, [params]);
  const router = useRouter();
  const [items, setItems] = useState<QuizItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const supabase = createPagesBrowserClient();

  useEffect(() => {
    async function loadExam() {
      try {
        const { data, error } = await supabase
          .from("attempt_items")
          .select("id, item_no, stem, choices, answer, explanation, correct")
          .eq("attempt_id", attemptId)
          .order("item_no");

        if (error || !data) {
          setError("Failed to load exam");
          return;
        }

        setItems(data);
      } catch (err) {
        console.error("Exam load error:", err);
        setError("Failed to load exam");
      } finally {
        setLoading(false);
      }
    }

    loadExam();
  }, [attemptId, supabase]);

  const currentItem = items[currentItemIndex];

  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/exam/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          itemNo: currentItem.item_no,
          answer: selectedAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit answer");
        return;
      }

      // Update local state
      const updatedItems = [...items];
      updatedItems[currentItemIndex] = {
        ...updatedItems[currentItemIndex],
        correct: data.correct,
      };
      setItems(updatedItems);

      // Move to next question or finish
      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
        setSelectedAnswer("");
      }
    } catch (err) {
      console.error("Answer submission error:", err);
      setError("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const completeExam = async () => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/exam/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to complete exam");
        return;
      }

      setScore(data.score);
      setStatus(data.status);
      setShowResults(true);
    } catch (err) {
      console.error("Exam completion error:", err);
      setError("Failed to complete exam");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "success";
    if (score >= 0.6) return "warning";
    return "error";
  };

  const getScoreText = (score: number) => {
    if (score >= 0.8) return "Passed!";
    if (score >= 0.6) return "Close, but not quite";
    return "Failed";
  };

  if (loading) {
    return (
      <>
        <AppBar title="Final Exam" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <CircularProgress />
              <Typography>Loading exam...</Typography>
            </Stack>
          </Paper>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppBar title="Final Exam" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Alert severity="error">{error}</Alert>
          </Paper>
        </Container>
      </>
    );
  }

  if (showResults && score !== null) {
    return (
      <>
        <AppBar title="Final Exam Results" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" gutterBottom>
                Exam Complete!
              </Typography>

              <Chip
                label={`${Math.round(score * 100)}%`}
                color={getScoreColor(score) as any}
                sx={{ fontSize: "1.5rem", p: 2 }}
              />

              <Typography variant="h6" color={getScoreColor(score)}>
                {getScoreText(score)}
              </Typography>

              <Typography variant="body1" textAlign="center">
                You answered {Math.round(score * items.length)} out of{" "}
                {items.length} questions correctly.
              </Typography>

              {status === "passed" && (
                <Alert severity="success" sx={{ width: "100%" }}>
                  Congratulations! Your draft certificate has been issued and is pending approval.
                </Alert>
              )}

              {status === "failed" && (
                <Alert severity="info" sx={{ width: "100%" }}>
                  You can retry the exam after reviewing the course material.
                </Alert>
              )}

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => router.push("/")}>
                  Go Home
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push("/course/CA/DE-ONLINE")}
                >
                  View Course
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar title="Final Exam" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          {/* Progress header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography variant="h5">
              Question {currentItemIndex + 1} of {items.length}
            </Typography>
            <Chip
              label={`${Math.round(((currentItemIndex + 1) / items.length) * 100)}%`}
              color="primary"
            />
          </Stack>

          {currentItem && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {currentItem.stem}
                </Typography>

                <RadioGroup
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                >
                  {currentItem.choices.map((choice, index) => (
                    <FormControlLabel
                      key={index}
                      value={choice}
                      control={<Radio />}
                      label={choice}
                      disabled={submitting}
                    />
                  ))}
                </RadioGroup>

                {/* Show result if answered */}
                {currentItem.correct !== null && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Chip
                        label={currentItem.correct ? "Correct!" : "Incorrect"}
                        color={currentItem.correct ? "success" : "error"}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {currentItem.explanation}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="outlined"
              disabled={currentItemIndex === 0}
              onClick={() => {
                setCurrentItemIndex((prev) => prev - 1);
                setSelectedAnswer("");
              }}
            >
              Previous
            </Button>

            <Button
              variant="contained"
              disabled={!selectedAnswer || submitting}
              onClick={currentItemIndex === items.length - 1 ? completeExam : submitAnswer}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting
                ? "Submitting..."
                : currentItemIndex === items.length - 1
                  ? "Submit Exam"
                  : "Next Question"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
