"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Alert,
  Box,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { 
  Download, 
  MoreVert, 
  PlayArrow, 
  CheckCircle, 
  Error as ErrorIcon, 
  Schedule,
  Cancel
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";

interface Jurisdiction {
  code: string;
  name: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
}

interface RegulatoryRun {
  id: string;
  j_code: string;
  course_id: string;
  period_start: string;
  period_end: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'canceled';
  started_at: string;
  finished_at: string;
  summary: {
    roster: number;
    exams: number;
    certs: number;
    seatTime: number;
  };
  created_at: string;
  courses: {
    code: string;
    title: string;
  };
  artifact_count: number;
}

interface RunsResponse {
  runs: RegulatoryRun[];
  pagination: {
    limit: number;
    total: number;
    next_cursor: string | null;
    has_more: boolean;
  };
  filters: {
    jCode: string | null;
    courseId: string | null;
  };
}

interface DryRunResponse {
  success: boolean;
  dryRun: boolean;
  summary: {
    roster: number;
    exams: number;
    certs: number;
    seatTime: number;
  };
  period: {
    start: string;
    end: string;
    days: number;
  };
}

export default function AdminCompliancePage() {
  const [runsData, setRunsData] = useState<RunsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<DryRunResponse | null>(null);
  const [showDryRunDialog, setShowDryRunDialog] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    jCode: "CA", // Default to CA
    courseId: "",
  });
  
  // Form state
  const [formData, setFormData] = useState({
    jCode: "CA",
    courseId: "",
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
  });

  // Data
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedRun, setSelectedRun] = useState<RegulatoryRun | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchJurisdictions = async () => {
    try {
      const response = await fetch('/api/admin/jurisdictions');
      if (response.ok) {
        const data = await response.json();
        setJurisdictions(data.jurisdictions || []);
      }
    } catch (error) {
      console.error('Error fetching jurisdictions:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.jCode) params.append('jCode', filters.jCode);
      if (filters.courseId) params.append('courseId', filters.courseId);
      params.append('limit', '20');

      const response = await fetch(`/api/admin/regulatory/runs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch regulatory runs');
      }

      const data = await response.json();
      setRunsData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch runs');
    } finally {
      setLoading(false);
    }
  }, [filters.jCode, filters.courseId]);

  useEffect(() => {
    fetchJurisdictions();
    fetchCourses();
    fetchRuns();
  }, [fetchRuns]);

  const handleDryRun = async () => {
    try {
      setDryRunLoading(true);
      setError(null);

      const response = await fetch('/api/admin/regulatory/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          periodStart: formData.periodStart.toISOString().split('T')[0],
          periodEnd: formData.periodEnd.toISOString().split('T')[0],
          dryRun: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform dry run');
      }

      const data = await response.json();
      setDryRunResult(data);
      setShowDryRunDialog(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to perform dry run');
    } finally {
      setDryRunLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/admin/regulatory/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          periodStart: formData.periodStart.toISOString().split('T')[0],
          periodEnd: formData.periodEnd.toISOString().split('T')[0],
          dryRun: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      
      // Refresh runs list
      await fetchRuns();
      
      // Show success message
      setError(null);
      alert(`Report generated successfully! Run ID: ${data.runId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (runId: string) => {
    try {
      const response = await fetch(`/api/admin/regulatory/runs/${runId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `regulatory-report-${runId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download report');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, run: RegulatoryRun) => {
    setAnchorEl(event.currentTarget);
    setSelectedRun(run);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRun(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle />;
      case 'failed':
        return <ErrorIcon />;
      case 'running':
        return <CircularProgress size={16} />;
      case 'pending':
        return <Schedule />;
      default:
        return <Cancel />;
    }
  };

  return (
    <AppShell>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Regulatory Compliance
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Generate Report Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate Report
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Jurisdiction</InputLabel>
                    <Select
                      value={formData.jCode}
                      label="Jurisdiction"
                      onChange={(e) => setFormData({ ...formData, jCode: e.target.value })}
                    >
                      {jurisdictions.map((j) => (
                        <MenuItem key={j.code} value={j.code}>
                          {j.name} ({j.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={formData.courseId}
                      label="Course"
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    >
                      {courses
                        .filter((c) => !formData.jCode || c.id.includes(formData.jCode))
                        .map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.code} - {c.title}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <DatePicker
                    label="Period Start"
                    value={formData.periodStart}
                    onChange={(date) => date && setFormData({ ...formData, periodStart: date })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />

                  <DatePicker
                    label="Period End"
                    value={formData.periodEnd}
                    onChange={(date) => date && setFormData({ ...formData, periodEnd: date })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={handleDryRun}
                      disabled={dryRunLoading || !formData.courseId}
                      startIcon={dryRunLoading ? <CircularProgress size={16} /> : null}
                    >
                      {dryRunLoading ? 'Checking...' : 'Dry Run'}
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleGenerateReport}
                      disabled={generating || !formData.courseId}
                      startIcon={generating ? <CircularProgress size={16} /> : null}
                    >
                      {generating ? 'Generating...' : 'Generate & Download'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Filters Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Filter Runs
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Jurisdiction</InputLabel>
                    <Select
                      value={filters.jCode}
                      label="Jurisdiction"
                      onChange={(e) => setFilters({ ...filters, jCode: e.target.value })}
                    >
                      <MenuItem value="">All</MenuItem>
                      {jurisdictions.map((j) => (
                        <MenuItem key={j.code} value={j.code}>
                          {j.name} ({j.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={filters.courseId}
                      label="Course"
                      onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                    >
                      <MenuItem value="">All</MenuItem>
                      {courses
                        .filter((c) => !filters.jCode || c.id.includes(filters.jCode))
                        .map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.code} - {c.title}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Runs Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report History
                </Typography>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date Range</TableCell>
                          <TableCell>Jurisdiction</TableCell>
                          <TableCell>Course</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Summary</TableCell>
                          <TableCell>Artifacts</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {runsData?.runs.map((run) => (
                          <TableRow key={run.id}>
                            <TableCell>
                              {new Date(run.period_start).toLocaleDateString()} - {new Date(run.period_end).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{run.j_code}</TableCell>
                            <TableCell>{run.courses.code}</TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(run.status)}
                                label={run.status}
                                color={getStatusColor(run.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {run.summary && (
                                <Box>
                                  <Typography variant="caption" display="block">
                                    Students: {run.summary.roster}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Exams: {run.summary.exams}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Certs: {run.summary.certs}
                                  </Typography>
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>{run.artifact_count}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, run)}
                                disabled={run.status !== 'succeeded'}
                              >
                                <MoreVert />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {runsData?.runs.length === 0 && !loading && (
                  <Box textAlign="center" p={3}>
                    <Typography color="textSecondary">
                      No regulatory runs found
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dry Run Dialog */}
        <Dialog open={showDryRunDialog} onClose={() => setShowDryRunDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Dry Run Results</DialogTitle>
          <DialogContent>
            {dryRunResult && (
              <Stack spacing={2}>
                <Typography>
                  <strong>Period:</strong> {dryRunResult.period.start} to {dryRunResult.period.end} ({dryRunResult.period.days} days)
                </Typography>
                <Divider />
                <Typography variant="h6">Summary Counts:</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>Students: {dryRunResult.summary.roster}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Exam Attempts: {dryRunResult.summary.exams}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Certificates: {dryRunResult.summary.certs}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Seat Time Records: {dryRunResult.summary.seatTime}</Typography>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDryRunDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedRun) {
              handleDownload(selectedRun.id);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download ZIP</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedRun) {
              window.open(`/admin/compliance/${selectedRun.id}`, '_blank');
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <PlayArrow fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        </Menu>
        </Container>
      </LocalizationProvider>
    </AppShell>
  );
}
