import * as React from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
} from "@mui/material";
import { getServerClient } from "@/lib/supabaseServer";
import AppBar from "@/components/AppBar";

export default async function AdminExamsPage() {
  const supabase = getServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="Admin - Exams" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>You must sign in to view this page.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get final exam attempts with user info
  const { data: attempts, error: attemptsError } = await supabase
    .from("attempts")
    .select(`
      id,
      student_id,
      course_id,
      score,
      started_at,
      completed_at,
      profiles!inner(role)
    `)
    .eq("mode", "final")
    .eq("profiles.role", "admin")
    .order("started_at", { ascending: false })
    .limit(100);

  if (attemptsError) {
    return (
      <>
        <AppBar title="Admin - Exams" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Failed to load exam attempts.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get user emails for display
  const userIds = attempts?.map(a => a.student_id) || [];
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  const userMap = new Map();
  if (!usersError && users) {
    users.users.forEach(user => {
      userMap.set(user.id, user.email);
    });
  }

  return (
    <>
      <AppBar title="Admin - Final Exams" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Final Exam Attempts
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts?.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      {userMap.get(attempt.student_id) || attempt.student_id}
                    </TableCell>
                    <TableCell>
                      {attempt.score !== null ? `${Math.round(attempt.score * 100)}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {attempt.completed_at ? (
                        <Chip 
                          label={attempt.score >= 0.8 ? "Passed" : "Failed"}
                          color={attempt.score >= 0.8 ? "success" : "error"}
                          size="small"
                        />
                      ) : (
                        <Chip label="In Progress" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(attempt.started_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {attempt.completed_at 
                        ? new Date(attempt.completed_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!attempts || attempts.length === 0) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No final exam attempts found.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}
