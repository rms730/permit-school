"use client";

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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Pagination,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

interface Question {
  id: string;
  skill: string;
  difficulty: number;
  stem: string;
  status: string;
  tags: string[];
  version: number;
  published_at: string | null;
  created_at: string;
  attempts: number;
  correct_count: number;
  p_correct: number;
  last_seen_at: string | null;
}

interface Course {
  id: string;
  code: string;
  title: string;
  jurisdictions: {
    name: string;
    code: string;
  };
}

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [tagFilter, setTagFilter] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalQuestions, setTotalQuestions] = React.useState(0);
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string>("");

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses");
    }
  };

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        course_id: selectedCourse,
        page: page.toString(),
        limit: "20",
      });

      if (searchQuery) params.append("q", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (tagFilter) params.append("tag", tagFilter);

      const response = await fetch(`/api/admin/questions/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setTotalPages(data.pagination.pages);
        setTotalQuestions(data.pagination.total);
      } else {
        setError("Failed to load questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, searchQuery, statusFilter, tagFilter, page]);

  const fetchTags = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/questions/tags?course_id=${selectedCourse}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }, [selectedCourse]);

  // Load courses on mount
  React.useEffect(() => {
    fetchCourses();
  }, []);

  // Load questions when course changes
  React.useEffect(() => {
    if (selectedCourse) {
      fetchQuestions();
      fetchTags();
    }
  }, [selectedCourse, searchQuery, statusFilter, tagFilter, page, fetchQuestions, fetchTags]);

  const handleArchive = async (questionId: string) => {
    try {
      const response = await fetch("/api/admin/questions/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId }),
      });

      if (response.ok) {
        fetchQuestions(); // Refresh the list
      } else {
        setError("Failed to archive question");
      }
    } catch (error) {
      console.error("Error archiving question:", error);
      setError("Failed to archive question");
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "success";
      case 2: return "info";
      case 3: return "warning";
      case 4: return "error";
      case 5: return "error";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "draft": return "warning";
      case "archived": return "error";
      default: return "default";
    }
  };

  const getPCorrectColor = (pCorrect: number) => {
    if (pCorrect < 0.3) return "error";
    if (pCorrect < 0.7) return "warning";
    return "success";
  };

  const formatPCorrect = (pCorrect: number) => {
    return `${(pCorrect * 100).toFixed(1)}%`;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (courses.length === 0) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>Loading courses...</Typography>
          </Paper>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">Question Bank</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => router.push("/admin/questions/import")}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => router.push(`/admin/questions/export?course_id=${selectedCourse}`)}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push(`/admin/questions/new?course_id=${selectedCourse}`)}
              >
                New Question
              </Button>
            </Stack>
          </Stack>

          {/* Filters */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Course"
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.jurisdictions.code} - {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              options={availableTags}
              value={tagFilter}
              onChange={(_, newValue) => setTagFilter(newValue || "")}
              renderInput={(params) => (
                <TextField {...params} label="Tag" sx={{ minWidth: 150 }} />
              )}
            />
          </Stack>

          {/* Questions Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Skill</TableCell>
                  <TableCell>Diff</TableCell>
                  <TableCell>Stem</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell>p(correct)</TableCell>
                  <TableCell>Attempts</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>{question.skill}</TableCell>
                      <TableCell>
                        <Chip
                          label={question.difficulty}
                          color={getDifficultyColor(question.difficulty) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{truncateText(question.stem)}</TableCell>
                      <TableCell>
                        <Chip
                          label={question.status}
                          color={getStatusColor(question.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {question.tags.slice(0, 2).map((tag) => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                          {question.tags.length > 2 && (
                            <Chip label={`+${question.tags.length - 2}`} size="small" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {question.last_seen_at
                          ? new Date(question.last_seen_at).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatPCorrect(question.p_correct)}
                          color={getPCorrectColor(question.p_correct) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{question.attempts}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Stats">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/admin/questions/${question.id}/stats`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {question.status !== "archived" && (
                            <Tooltip title="Archive">
                              <IconButton
                                size="small"
                                onClick={() => handleArchive(question.id)}
                              >
                                <ArchiveIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
              />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Showing {questions.length} of {totalQuestions} questions
          </Typography>
        </Paper>
      </Container>
    </AppShell>
  );
}
