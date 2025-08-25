import { ArrowUpward, ArrowDownward, Edit, Map } from "@mui/icons-material";
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
  IconButton,
  Checkbox,
  Box,
} from "@mui/material";
import Link from "next/link";
import * as React from "react";

import AppBar from "@/components/AppBar";
import { getServerClient } from "@/lib/supabaseServer";

import UnitEditDialog from "./UnitEditDialog";
import UnitMappingDialog from "./UnitMappingDialog";

export default async function AdminCourseUnitsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await getServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="Admin - Course Units" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>You must sign in to view this page.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get course info
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(`
      id,
      code,
      title,
      jurisdictions(name, code)
    `)
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return (
      <>
        <AppBar title="Admin - Course Units" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Course not found.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get units for this course
  const { data: units, error: unitsError } = await supabase
    .from("course_units")
    .select(`
      id,
      unit_no,
      title,
      minutes_required,
      objectives,
      is_published,
      updated_at
    `)
    .eq("course_id", courseId)
    .order("unit_no", { ascending: true });

  if (unitsError) {
    return (
      <>
        <AppBar title="Admin - Course Units" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Failed to load units.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar title={`Admin - ${course.code} Units`} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4">
                {course.code} - {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(course.jurisdictions as any)?.name || (course.jurisdictions as any)?.code}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                component={Link}
                href="/admin/curriculum"
              >
                Back to Courses
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/admin/reports"
              >
                Reports
              </Button>
            </Stack>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Unit No</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Minutes</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {units?.map((unit, index) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {unit.unit_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {unit.title}
                      </Typography>
                      {unit.objectives && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {unit.objectives.length > 100 
                            ? `${unit.objectives.substring(0, 100)}...`
                            : unit.objectives
                          }
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {unit.minutes_required} min
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={unit.is_published}
                        disabled
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(unit.updated_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          title="Move Up"
                        >
                          <ArrowUpward />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={index === (units?.length || 0) - 1}
                          title="Move Down"
                        >
                          <ArrowDownward />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Edit Unit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Map Content"
                        >
                          <Map />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!units || units.length === 0) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No units found for this course.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}
