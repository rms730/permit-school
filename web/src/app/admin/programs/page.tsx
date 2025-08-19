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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

interface Program {
  id: string;
  code: string;
  kind: 'permit' | 'test_prep';
  title: string;
  title_i18n: Record<string, string>;
  active: boolean;
  created_at: string;
  updated_at: string;
  courses_count?: number;
  tests_count?: number;
}

interface StandardizedTest {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  sections_count: number;
  program_id: string;
}

export default function AdminProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [tests, setTests] = React.useState<StandardizedTest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  
  // Dialog states
  const [programDialogOpen, setProgramDialogOpen] = React.useState(false);
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [editingProgram, setEditingProgram] = React.useState<Program | null>(null);
  const [editingTest, setEditingTest] = React.useState<StandardizedTest | null>(null);
  
  // Form states
  const [programForm, setProgramForm] = React.useState({
    code: "",
    kind: "permit" as 'permit' | 'test_prep',
    title: "",
    title_en: "",
    title_es: "",
    active: true,
  });
  
  const [testForm, setTestForm] = React.useState({
    code: "",
    name: "",
    description: "",
    active: true,
    program_id: "",
  });

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/programs");
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs);
      } else {
        setError("Failed to load programs");
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setError("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/admin/standardized-tests");
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  React.useEffect(() => {
    fetchPrograms();
    fetchTests();
  }, []);

  const handleCreateProgram = async () => {
    try {
      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...programForm,
          title_i18n: {
            en: programForm.title_en,
            es: programForm.title_es,
          },
        }),
      });

      if (response.ok) {
        setSuccess("Program created successfully");
        setProgramDialogOpen(false);
        resetProgramForm();
        fetchPrograms();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create program");
      }
    } catch (error) {
      console.error("Error creating program:", error);
      setError("Failed to create program");
    }
  };

  const handleUpdateProgram = async () => {
    if (!editingProgram) return;
    
    try {
      const response = await fetch(`/api/admin/programs/${editingProgram.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...programForm,
          title_i18n: {
            en: programForm.title_en,
            es: programForm.title_es,
          },
        }),
      });

      if (response.ok) {
        setSuccess("Program updated successfully");
        setProgramDialogOpen(false);
        resetProgramForm();
        fetchPrograms();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update program");
      }
    } catch (error) {
      console.error("Error updating program:", error);
      setError("Failed to update program");
    }
  };

  const handleCreateTest = async () => {
    try {
      const response = await fetch("/api/admin/standardized-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testForm),
      });

      if (response.ok) {
        setSuccess("Test created successfully");
        setTestDialogOpen(false);
        resetTestForm();
        fetchTests();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create test");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      setError("Failed to create test");
    }
  };

  const handleUpdateTest = async () => {
    if (!editingTest) return;
    
    try {
      const response = await fetch(`/api/admin/standardized-tests/${editingTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testForm),
      });

      if (response.ok) {
        setSuccess("Test updated successfully");
        setTestDialogOpen(false);
        resetTestForm();
        fetchTests();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      setError("Failed to update test");
    }
  };

  const resetProgramForm = () => {
    setProgramForm({
      code: "",
      kind: "permit",
      title: "",
      title_en: "",
      title_es: "",
      active: true,
    });
    setEditingProgram(null);
  };

  const resetTestForm = () => {
    setTestForm({
      code: "",
      name: "",
      description: "",
      active: true,
      program_id: "",
    });
    setEditingTest(null);
  };

  const openEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramForm({
      code: program.code,
      kind: program.kind,
      title: program.title,
      title_en: program.title_i18n?.en || "",
      title_es: program.title_i18n?.es || "",
      active: program.active,
    });
    setProgramDialogOpen(true);
  };

  const openEditTest = (test: StandardizedTest) => {
    setEditingTest(test);
    setTestForm({
      code: test.code,
      name: test.name,
      description: test.description,
      active: test.active,
      program_id: test.program_id,
    });
    setTestDialogOpen(true);
  };

  const getProgramIcon = (kind: string) => {
    return kind === 'permit' ? <DriveEtaIcon /> : <AssessmentIcon />;
  };

  const getProgramColor = (kind: string) => {
    return kind === 'permit' ? 'primary' : 'secondary';
  };

  return (
    <AppShell>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Program Management
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetProgramForm();
                  setProgramDialogOpen(true);
                }}
              >
                Add Program
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetTestForm();
                  setTestDialogOpen(true);
                }}
              >
                Add Test
              </Button>
            </Stack>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {/* Programs Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                Programs
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Program</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Courses</TableCell>
                      <TableCell>Tests</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getProgramIcon(program.kind)}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {program.code}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={program.kind === 'permit' ? 'Driver Permit' : 'Test Prep'}
                            color={getProgramColor(program.kind)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{program.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={program.active ? 'Active' : 'Inactive'}
                            color={program.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{program.courses_count || 0}</TableCell>
                        <TableCell>{program.tests_count || 0}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEditProgram(program)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/admin/programs/${program.id}`)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Standardized Tests Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                Standardized Tests
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Test</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Sections</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {test.code}
                          </Typography>
                        </TableCell>
                        <TableCell>{test.name}</TableCell>
                        <TableCell>
                          {programs.find(p => p.id === test.program_id)?.code || 'Unknown'}
                        </TableCell>
                        <TableCell>{test.sections_count}</TableCell>
                        <TableCell>
                          <Chip
                            label={test.active ? 'Active' : 'Inactive'}
                            color={test.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEditTest(test)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/admin/tests/${test.id}`)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Stack>

        {/* Program Dialog */}
        <Dialog open={programDialogOpen} onClose={() => setProgramDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingProgram ? 'Edit Program' : 'Create New Program'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Program Code"
                value={programForm.code}
                onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Program Type</InputLabel>
                <Select
                  value={programForm.kind}
                  onChange={(e) => setProgramForm({ ...programForm, kind: e.target.value as 'permit' | 'test_prep' })}
                  label="Program Type"
                >
                  <MenuItem value="permit">Driver Permit</MenuItem>
                  <MenuItem value="test_prep">Test Prep</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Title (English)"
                value={programForm.title_en}
                onChange={(e) => setProgramForm({ ...programForm, title_en: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Title (Spanish)"
                value={programForm.title_es}
                onChange={(e) => setProgramForm({ ...programForm, title_es: e.target.value })}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={programForm.active}
                    onChange={(e) => setProgramForm({ ...programForm, active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProgramDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={editingProgram ? handleUpdateProgram : handleCreateProgram}
              variant="contained"
            >
              {editingProgram ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Test Dialog */}
        <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTest ? 'Edit Test' : 'Create New Test'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Test Code"
                value={testForm.code}
                onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Test Name"
                value={testForm.name}
                onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={testForm.description}
                onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Program</InputLabel>
                <Select
                  value={testForm.program_id}
                  onChange={(e) => setTestForm({ ...testForm, program_id: e.target.value })}
                  label="Program"
                >
                  {programs.filter(p => p.kind === 'test_prep').map((program) => (
                    <MenuItem key={program.id} value={program.id}>
                      {program.code} - {program.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={testForm.active}
                    onChange={(e) => setTestForm({ ...testForm, active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={editingTest ? handleUpdateTest : handleCreateTest}
              variant="contained"
            >
              {editingTest ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppShell>
  );
}
