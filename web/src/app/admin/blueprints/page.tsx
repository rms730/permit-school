"use client";

import * as React from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  PlayArrow as ActivateIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import AppBar from "@/components/AppBar";

interface BlueprintRule {
  rule_no: number;
  skill: string;
  count: number;
  min_difficulty?: number;
  max_difficulty?: number;
  include_tags?: string[];
  exclude_tags?: string[];
}

interface Blueprint {
  id: string;
  name: string;
  total_questions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  exam_blueprint_rules: BlueprintRule[];
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

export default function AdminBlueprintsPage() {
  const router = useRouter();
  const [blueprints, setBlueprints] = React.useState<Blueprint[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const [activateDialog, setActivateDialog] = React.useState<{
    open: boolean;
    blueprint: Blueprint | null;
  }>({ open: false, blueprint: null });

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

  const fetchBlueprints = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blueprints?course_id=${selectedCourse}`);
      if (response.ok) {
        const data = await response.json();
        setBlueprints(data.blueprints);
      } else {
        setError("Failed to load blueprints");
      }
    } catch (error) {
      console.error("Error fetching blueprints:", error);
      setError("Failed to load blueprints");
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  // Load courses on mount
  React.useEffect(() => {
    fetchCourses();
  }, []);

  // Load blueprints when course changes
  React.useEffect(() => {
    if (selectedCourse) {
      fetchBlueprints();
    }
  }, [selectedCourse, fetchBlueprints]);

  const handleActivate = async (blueprint: Blueprint) => {
    try {
      const response = await fetch("/api/admin/blueprints/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: blueprint.id,
          course_id: selectedCourse,
        }),
      });

      if (response.ok) {
        setSuccess("Blueprint activated successfully");
        fetchBlueprints(); // Refresh the list
        setActivateDialog({ open: false, blueprint: null });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to activate blueprint");
      }
    } catch (error) {
      console.error("Error activating blueprint:", error);
      setError("Failed to activate blueprint");
    }
  };

  const handleDuplicate = async (blueprint: Blueprint) => {
    try {
      const duplicatedBlueprint = {
        ...blueprint,
        id: undefined, // Remove ID to create new
        name: `${blueprint.name} (Copy)`,
        is_active: false,
      };

      const response = await fetch("/api/admin/blueprints/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: selectedCourse,
          name: duplicatedBlueprint.name,
          total_questions: duplicatedBlueprint.total_questions,
          rules: duplicatedBlueprint.exam_blueprint_rules,
        }),
      });

      if (response.ok) {
        setSuccess("Blueprint duplicated successfully");
        fetchBlueprints(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to duplicate blueprint");
      }
    } catch (error) {
      console.error("Error duplicating blueprint:", error);
      setError("Failed to duplicate blueprint");
    }
  };

  const handleDelete = async (blueprintId: string) => {
    if (!confirm("Are you sure you want to delete this blueprint?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blueprints/${blueprintId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Blueprint deleted successfully");
        fetchBlueprints(); // Refresh the list
      } else {
        setError("Failed to delete blueprint");
      }
    } catch (error) {
      console.error("Error deleting blueprint:", error);
      setError("Failed to delete blueprint");
    }
  };

  const getActiveBlueprint = () => {
    return blueprints.find(b => b.is_active);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (courses.length === 0) {
    return (
      <>
        <AppBar title="Admin - Blueprints" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>Loading courses...</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar title="Admin - Blueprints" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4">Exam Blueprints</Typography>
              {getActiveBlueprint() && (
                <Chip
                  icon={<ActiveIcon />}
                  label={`Active: ${getActiveBlueprint()?.name}`}
                  color="success"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push(`/admin/blueprints/new?course_id=${selectedCourse}`)}
            >
              New Blueprint
            </Button>
          </Stack>

          {/* Course Selector */}
          <FormControl sx={{ minWidth: 300, mb: 3 }}>
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

          {/* Blueprints Grid */}
          <Grid container spacing={3}>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Skeleton />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Skeleton />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              blueprints.map((blueprint) => (
                <Grid item xs={12} md={6} lg={4} key={blueprint.id}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" gutterBottom>
                          {blueprint.name}
                        </Typography>
                        {blueprint.is_active && (
                          <Chip
                            icon={<ActiveIcon />}
                            label="Active"
                            color="success"
                            size="small"
                          />
                        )}
                      </Stack>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {blueprint.total_questions} questions
                      </Typography>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created: {formatDate(blueprint.created_at)}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Rules:
                      </Typography>
                      <List dense>
                        {blueprint.exam_blueprint_rules.map((rule) => (
                          <ListItem key={rule.rule_no} sx={{ py: 0 }}>
                            <ListItemText
                              primary={`${rule.skill} (${rule.count})`}
                              secondary={`Difficulty: ${rule.min_difficulty || 1}-${rule.max_difficulty || 5}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>

                    <CardActions>
                      <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/admin/blueprints/${blueprint.id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        {!blueprint.is_active && (
                          <Tooltip title="Activate">
                            <IconButton
                              size="small"
                              onClick={() => setActivateDialog({ open: true, blueprint })}
                            >
                              <ActivateIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Duplicate">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicate(blueprint)}
                          >
                            <DuplicateIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(blueprint.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          {!loading && blueprints.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No blueprints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first blueprint to get started
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Activate Confirmation Dialog */}
        <Dialog
          open={activateDialog.open}
          onClose={() => setActivateDialog({ open: false, blueprint: null })}
        >
          <DialogTitle>Activate Blueprint</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to activate &quot;{activateDialog.blueprint?.name}&quot;?
              This will deactivate any currently active blueprint for this course.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActivateDialog({ open: false, blueprint: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => handleActivate(activateDialog.blueprint!)}
              variant="contained"
              color="primary"
            >
              Activate
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
