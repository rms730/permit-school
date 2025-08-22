import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Box,
  LinearProgress,
} from "@mui/material";
import Link from "next/link";
import * as React from "react";

import AppBar from "@/components/AppBar";
import { getEntitlementForUser } from "@/lib/entitlements";
import { getServerClient } from "@/lib/supabaseServer";

export default async function ExamPage() {
  const supabase = getServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="Final Exam" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Alert severity="info">
              You must sign in to take the final exam.
            </Alert>
          </Paper>
        </Container>
      </>
    );
  }

  // Check entitlement
  const { active: isEntitled } = await getEntitlementForUser('CA');

  if (!isEntitled) {
    return (
      <>
        <AppBar title="Final Exam" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                Final Exam
              </Typography>
              <Alert 
                severity="warning" 
                action={
                  <Button color="inherit" size="small" component={Link} href="/billing">
                    Upgrade
                  </Button>
                }
              >
                A subscription is required to take the final exam. Please upgrade to access all course features.
              </Alert>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" component={Link} href="/course/CA/DE-ONLINE">
                  Continue Course
                </Button>
                <Button variant="contained" component={Link} href="/billing">
                  Go to Billing
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </>
    );
  }

  // Get course ID for DE-ONLINE
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("code", "DE-ONLINE")
    .single();

  if (courseError || !course) {
    return (
      <>
        <AppBar title="Final Exam" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Alert severity="error">
              Course not found.
            </Alert>
          </Paper>
        </Container>
      </>
    );
  }

  // Check seat time
  const { data: seatTime, error: seatTimeError } = await supabase
    .from("v_course_seat_time")
    .select("minutes_total")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  const minutesRequired = parseInt(process.env.FINAL_EXAM_MINUTES_REQUIRED || '150');
  const minutesTotal = seatTime?.minutes_total || 0;
  const isEligible = minutesTotal >= minutesRequired;

  return (
    <>
      <AppBar title="Final Exam" />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h4" gutterBottom>
              Final Exam
            </Typography>

            <Typography variant="body1">
              The final exam tests your knowledge of all course material. You must complete 
              {minutesRequired} minutes of study time before taking the exam.
            </Typography>

            {!isEligible ? (
              <>
                <Alert severity="info">
                  <Typography variant="body2" gutterBottom>
                    You need {minutesRequired - Math.floor(minutesTotal)} more minutes of study time.
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {Math.floor(minutesTotal)} / {minutesRequired} minutes
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(minutesTotal / minutesRequired) * 100} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Alert>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" component={Link} href="/course/CA/DE-ONLINE">
                    Continue Studying
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Alert severity="success">
                  You are eligible to take the final exam! You have completed {Math.floor(minutesTotal)} minutes of study time.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  The exam consists of {process.env.FINAL_EXAM_NUM_QUESTIONS || '30'} questions. 
                  You need to score {(parseFloat(process.env.FINAL_EXAM_PASS_PCT || '0.8') * 100).toFixed(0)}% to pass.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" component={Link} href="/course/CA/DE-ONLINE">
                    Review Course
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    href="/exam/start"
                    sx={{ minWidth: 200 }}
                  >
                    Start Final Exam
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
