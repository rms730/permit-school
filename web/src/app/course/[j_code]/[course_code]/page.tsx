import * as React from "react";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Chip,
  Box,
  LinearProgress,
} from "@mui/material";
import { getServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import AppBar from "@/components/AppBar";

interface Unit {
  id: string;
  unit_no: number;
  title: string;
  minutes_required: number;
}

interface UnitProgress {
  unit_no: number;
  time_ms: number;
}

interface PageProps {
  params: {
    j_code: string;
    course_code: string;
  };
}

export const dynamic = "force-dynamic";

export default async function CourseOutlinePage({ params }: PageProps) {
  const supabase = getServerClient();
  const { j_code, course_code } = params;

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography>You must sign in to view this course.</Typography>
        </Paper>
      </Container>
    );
  }

  // Get course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title")
    .eq("j_code", j_code)
    .eq("code", course_code)
    .single();

  if (courseError || !course) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="error">Course not found.</Typography>
        </Paper>
      </Container>
    );
  }

  // Get units
  const { data: units, error: unitsError } = await supabase
    .from("course_units")
    .select("id, unit_no, title, minutes_required")
    .eq("course_id", course.id)
    .order("unit_no");

  if (unitsError || !units) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="error">Failed to load course units.</Typography>
        </Paper>
      </Container>
    );
  }

  // Get user progress
  const { data: progress, error: progressError } = await supabase
    .from("unit_progress")
    .select("unit_no, time_ms")
    .eq("student_id", user.id)
    .eq("course_id", course.id);

  if (progressError) {
    console.error("Progress query error:", progressError);
  }

  const progressMap = new Map<number, number>();
  (progress || []).forEach((p) => {
    progressMap.set(p.unit_no, p.time_ms);
  });

  // Get completed attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from("attempts")
    .select("unit_no, score")
    .eq("student_id", user.id)
    .eq("course_id", course.id)
    .not("completed_at", "is", null);

  if (attemptsError) {
    console.error("Attempts query error:", attemptsError);
  }

  const completedUnits = new Set<number>();
  (attempts || []).forEach((a) => {
    if (a.unit_no && a.score !== null) {
      completedUnits.add(a.unit_no);
    }
  });

  function getUnitStatus(
    unit: Unit,
  ): "not_started" | "in_progress" | "ready" | "completed" {
    if (completedUnits.has(unit.unit_no)) {
      return "completed";
    }

    const timeMs = progressMap.get(unit.unit_no) || 0;
    const requiredMs = unit.minutes_required * 60000;

    if (timeMs === 0) {
      return "not_started";
    } else if (timeMs >= requiredMs) {
      return "ready";
    } else {
      return "in_progress";
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "success";
      case "ready":
        return "primary";
      case "in_progress":
        return "warning";
      default:
        return "default";
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case "completed":
        return "Completed";
      case "ready":
        return "Ready for Quiz";
      case "in_progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  }

  return (
    <>
      <AppBar title={`${course.title} - Course`} />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {j_code} • {course_code}
        </Typography>

        <List sx={{ mt: 3 }}>
          {units.map((unit) => {
            const status = getUnitStatus(unit);
            const timeMs = progressMap.get(unit.unit_no) || 0;
            const requiredMs = unit.minutes_required * 60000;
            const progressPercent = Math.min((timeMs / requiredMs) * 100, 100);

            return (
              <ListItem
                key={unit.id}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 2,
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="h6">
                      Unit {unit.unit_no}: {unit.title}
                    </Typography>
                    <Chip
                      label={getStatusText(status)}
                      color={getStatusColor(status) as any}
                      size="small"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {unit.minutes_required} minutes required
                  </Typography>

                  {status === "in_progress" && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption">
                        {Math.floor(timeMs / 60000)} / {unit.minutes_required}{" "}
                        minutes
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2}>
                    {status === "not_started" && (
                      <Button
                        component={Link}
                        href={`/learn/${unit.id}`}
                        variant="contained"
                        size="small"
                      >
                        Start
                      </Button>
                    )}

                    {status === "in_progress" && (
                      <Button
                        component={Link}
                        href={`/learn/${unit.id}`}
                        variant="contained"
                        size="small"
                      >
                        Resume
                      </Button>
                    )}

                    {status === "ready" && (
                      <>
                        <Button
                          component={Link}
                          href={`/learn/${unit.id}`}
                          variant="outlined"
                          size="small"
                        >
                          Review
                        </Button>
                        <Button
                          component={Link}
                          href={`/quiz/start/${unit.id}`}
                          variant="contained"
                          size="small"
                        >
                          Take Quiz
                        </Button>
                      </>
                    )}

                    {status === "completed" && (
                      <Button
                        component={Link}
                        href={`/learn/${unit.id}`}
                        variant="outlined"
                        size="small"
                      >
                        Review
                      </Button>
                    )}
                  </Stack>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Container>
    </>
  );
}
