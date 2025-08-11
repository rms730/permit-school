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
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { 
  Download, 
  ArrowBack,
  CheckCircle, 
  Error as ErrorIcon, 
  Schedule,
  Cancel,
  FileDownload
} from "@mui/icons-material";
import AppBar from "@/components/AppBar";
import Link from "next/link";

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
}

interface RegulatoryArtifact {
  run_id: string;
  name: string;
  storage_path: string;
  sha256: string;
  bytes: number;
  created_at: string;
}

export default function AdminComplianceRunDetailsPage({ 
  params 
}: { 
  params: { runId: string } 
}) {
  const [run, setRun] = useState<RegulatoryRun | null>(null);
  const [artifacts, setArtifacts] = useState<RegulatoryArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchRunDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch run details
      const runResponse = await fetch(`/api/admin/regulatory/runs?runId=${params.runId}`);
      if (!runResponse.ok) {
        throw new Error('Failed to fetch run details');
      }

      const runData = await runResponse.json();
      const runDetails = runData.runs?.find((r: any) => r.id === params.runId);
      
      if (!runDetails) {
        throw new Error('Run not found');
      }

      setRun(runDetails);

      // Fetch artifacts
      const artifactsResponse = await fetch(`/api/admin/regulatory/runs/${params.runId}/artifacts`);
      if (artifactsResponse.ok) {
        const artifactsData = await artifactsResponse.json();
        setArtifacts(artifactsData.artifacts || []);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch run details');
    } finally {
      setLoading(false);
    }
  }, [params.runId]);

  useEffect(() => {
    fetchRunDetails();
  }, [fetchRunDetails]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      const response = await fetch(`/api/admin/regulatory/runs/${params.runId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `regulatory-report-${params.runId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download report');
    } finally {
      setDownloading(false);
    }
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <>
        <AppBar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error || !run) {
    return (
      <>
        <AppBar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Run not found'}
          </Alert>
          <Button
            component={Link}
            href="/admin/compliance"
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back to Compliance
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} href="/admin/compliance" color="inherit">
            Compliance
          </MuiLink>
          <Typography color="text.primary">Run Details</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Regulatory Report: {run.courses.code}
          </Typography>
          <Button
            component={Link}
            href="/admin/compliance"
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Run Details Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Run Details
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusIcon(run.status)}
                      label={run.status}
                      color={getStatusColor(run.status) as any}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Jurisdiction
                    </Typography>
                    <Typography>{run.j_code}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Course
                    </Typography>
                    <Typography>{run.courses.code} - {run.courses.title}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Period
                    </Typography>
                    <Typography>
                      {new Date(run.period_start).toLocaleDateString()} - {new Date(run.period_end).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Created
                    </Typography>
                    <Typography>{formatDate(run.created_at)}</Typography>
                  </Box>

                  {run.started_at && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Started
                      </Typography>
                      <Typography>{formatDate(run.started_at)}</Typography>
                    </Box>
                  )}

                  {run.finished_at && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Finished
                      </Typography>
                      <Typography>{formatDate(run.finished_at)}</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary Counts
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {run.summary?.roster || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Students
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {run.summary?.exams || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Exam Attempts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {run.summary?.certs || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Certificates
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {run.summary?.seatTime || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Seat Time Records
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {run.status === 'succeeded' && (
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
                      onClick={handleDownload}
                      disabled={downloading}
                      fullWidth
                    >
                      {downloading ? 'Downloading...' : 'Download ZIP'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Artifacts Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Artifacts ({artifacts.length})
                </Typography>

                {artifacts.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>SHA256</TableCell>
                          <TableCell>Created</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {artifacts.map((artifact) => (
                          <TableRow key={artifact.name}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <FileDownload sx={{ mr: 1, color: 'text.secondary' }} />
                                {artifact.name}
                              </Box>
                            </TableCell>
                            <TableCell>{formatBytes(artifact.bytes)}</TableCell>
                            <TableCell>
                              <Typography variant="caption" fontFamily="monospace">
                                {artifact.sha256.substring(0, 16)}...
                              </Typography>
                            </TableCell>
                            <TableCell>{formatDate(artifact.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box textAlign="center" p={3}>
                    <Typography color="textSecondary">
                      No artifacts found
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
