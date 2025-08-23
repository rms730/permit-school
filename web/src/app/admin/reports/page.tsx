import { Download, PictureAsPdf, TableChart } from "@mui/icons-material";
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
} from "@mui/material";
import Link from "next/link";
import * as React from "react";

import AppBar from "@/components/AppBar";
import { getServerClient } from "@/lib/supabaseServer";


export default async function AdminReportsPage() {
  const supabase = await getServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="Admin - Reports" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>You must sign in to view this page.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get courses for selection
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select(`
      id,
      code,
      title,
      jurisdictions(name, code)
    `)
    .order("code", { ascending: true });

  if (coursesError) {
    return (
      <>
        <AppBar title="Admin - Reports" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Failed to load courses.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar title="Admin - Reports" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">
              Compliance Reports
            </Typography>
            <Button
              variant="outlined"
              component={Link}
              href="/admin/curriculum"
            >
              Back to Curriculum
            </Button>
          </Stack>

          <Stack spacing={3}>
            {/* Syllabus PDF Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <PictureAsPdf color="primary" />
                  <Typography variant="h6">
                    Syllabus PDF
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generate a course syllabus with unit details, learning objectives, and time requirements.
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Course</InputLabel>
                  <Select
                    label="Select Course"
                    defaultValue=""
                  >
                    {courses?.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  disabled
                >
                  Generate Syllabus PDF
                </Button>
              </CardActions>
            </Card>

            {/* Evidence CSV Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <TableChart color="primary" />
                  <Typography variant="h6">
                    Evidence of Study CSV
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Export student progress data including seat time, quiz results, and certificate status.
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Select Course</InputLabel>
                    <Select
                      label="Select Course"
                      defaultValue=""
                    >
                      {courses?.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.code} - {course.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="From Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="To Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                </Stack>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  disabled
                >
                  Generate Evidence CSV
                </Button>
              </CardActions>
            </Card>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
