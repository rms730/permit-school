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
  Button,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import Link from "next/link";
import * as React from "react";

import AppBar from "@/components/AppBar";
import { getServerClient } from "@/lib/supabaseServer";


export default async function AdminCurriculumPage() {
  const supabase = await getServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="Admin - Curriculum" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>You must sign in to view this page.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get courses with jurisdiction info
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select(`
      id,
      code,
      title,
      active,
      hours_required_minutes,
      jurisdictions(name, code)
    `)
    .order("code", { ascending: true });

  if (coursesError) {
    return (
      <>
        <AppBar title="Admin - Curriculum" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Failed to load courses.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get unit counts for each course
  const { data: allUnits, error: unitsError } = await supabase
    .from("course_units")
    .select("course_id");

  const unitCountMap = new Map();
  if (!unitsError && allUnits) {
    allUnits.forEach(({ course_id }) => {
      unitCountMap.set(course_id, (unitCountMap.get(course_id) || 0) + 1);
    });
  }

  return (
    <>
      <AppBar title="Admin - Curriculum" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">
              Curriculum Management
            </Typography>
            <Button
              variant="outlined"
              component={Link}
              href="/admin/reports"
            >
              Reports
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>Required Hours</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses?.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {course.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {course.title}
                    </TableCell>
                    <TableCell>
                      {(course.jurisdictions as any)?.code || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={course.active ? 'Active' : 'Inactive'}
                        color={course.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {unitCountMap.get(course.id) || 0} units
                    </TableCell>
                    <TableCell>
                      {course.hours_required_minutes 
                        ? `${Math.round(course.hours_required_minutes / 60)} hours`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          href={`/admin/curriculum/${course.id}`}
                        >
                          Manage Units
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!courses || courses.length === 0) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No courses found.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}
