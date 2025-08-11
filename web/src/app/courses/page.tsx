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
  Button,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import { getServerClient } from "@/lib/supabaseServer";
import AppBar from "@/components/AppBar";
import Link from "next/link";

export default async function CoursesPage() {
  const supabase = getServerClient();

  // Get course catalog
  const { data: catalog, error: catalogError } = await supabase
    .from("v_course_catalog")
    .select("*")
    .order("j_code", { ascending: true });

  if (catalogError) {
    return (
      <>
        <AppBar title="Available Courses" />
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
      <AppBar title="Available Courses" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">
              Available Courses
            </Typography>
            <Button
              variant="outlined"
              component={Link}
              href="/"
            >
              Back to Home
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalog?.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell>
                      <Chip 
                        label={course.j_code} 
                        color="primary" 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {course.course_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {course.course_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {course.has_price ? (
                        <Chip 
                          label="Available" 
                          color="success" 
                          size="small"
                        />
                      ) : (
                        <Chip 
                          label="Coming Soon" 
                          color="default" 
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          href={`/course/${course.j_code}/${course.course_code}`}
                        >
                          View Course
                        </Button>
                        {course.has_price && (
                          <Button
                            variant="contained"
                            size="small"
                            component={Link}
                            href="/billing"
                          >
                            Upgrade
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!catalog || catalog.length === 0) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No courses available at this time.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}
