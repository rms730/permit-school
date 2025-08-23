'use client';

import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,

} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface InventoryStatus {
  j_code: string;
  total: number;
  available: number;
  used: number;
  last_used_at: string | null;
}

interface Batch {
  id: string;
  j_code: string;
  course_id: string | null;
  course_title: string | null;
  course_code: string | null;
  status: string;
  counts: {
    queued: number;
    exported: number;
    mailed: number;
    void: number;
    reprint: number;
  };
  export_path: string | null;
  hmac_sha256: string | null;
  created_by: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
}

export default function FulfillmentPage() {
  const router = useRouter();
  const [jCode, setJCode] = useState('CA');
  const [courseId, setCourseId] = useState<string>('');
  const [dryRun, setDryRun] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const lowStockThreshold = parseInt(process.env.NEXT_PUBLIC_FULFILLMENT_LOW_STOCK_THRESHOLD || '200');

  useEffect(() => {
    fetchInventory();
    fetchBatches();
    fetchCourses();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/fulfillment/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/admin/fulfillment/batches?limit=10');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
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
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const response = await fetch('/api/admin/fulfillment/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          j_code: jCode,
          course_id: courseId || null,
          dryRun
        }),
      });

      const result = await response.json();
      setExportResult(result);

      if (result.success && !dryRun) {
        fetchBatches();
        fetchInventory();
      }
    } catch (error) {
      setExportResult({ error: 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async (batchId: string) => {
    try {
      const response = await fetch(`/api/admin/fulfillment/batches/${batchId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fulfillment-batch-${batchId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleReconcile = (batch: Batch) => {
    setSelectedBatch(batch);
    setReconcileDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'exported': return 'info';
      case 'reconciled': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const caInventory = inventory.find(inv => inv.j_code === 'CA');
  const isLowStock = caInventory && caInventory.available < lowStockThreshold;

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Certificate Fulfillment
      </Typography>
      {/* Export Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Run Export
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid
              xs={12}
              sm={3}>
              <FormControl fullWidth>
                <InputLabel>Jurisdiction</InputLabel>
                <Select
                  value={jCode}
                  onChange={(e) => setJCode(e.target.value)}
                  label="Jurisdiction"
                >
                  <MenuItem value="CA">California (CA)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid
              xs={12}
              sm={3}>
              <FormControl fullWidth>
                <InputLabel>Course (Optional)</InputLabel>
                <Select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  label="Course (Optional)"
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid
              xs={12}
              sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                  />
                }
                label="Dry Run"
              />
            </Grid>
            
            <Grid
              xs={12}
              sm={3}>
              <Button
                variant="contained"
                onClick={handleExport}
                disabled={isExporting}
                fullWidth
              >
                {isExporting ? 'Exporting...' : dryRun ? 'Test Export' : 'Run Export'}
              </Button>
            </Grid>
          </Grid>

          {exportResult && (
            <Alert 
              severity={exportResult.error ? 'error' : 'success'} 
              sx={{ mt: 2 }}
            >
              {exportResult.error || exportResult.message || 
                `Export completed: ${exportResult.count} certificates`}
            </Alert>
          )}
        </CardContent>
      </Card>
      {/* Inventory Widget */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Inventory Status
            </Typography>
            <IconButton onClick={fetchInventory} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
          
          {caInventory && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip 
                label={`Available: ${caInventory.available}`}
                color={isLowStock ? 'error' : 'success'}
                icon={isLowStock ? <WarningIcon /> : undefined}
              />
              <Chip label={`Used: ${caInventory.used}`} />
              <Chip label={`Total: ${caInventory.total}`} />
              {isLowStock && (
                <Alert severity="warning" sx={{ flex: 1 }}>
                  Low stock alert: Only {caInventory.available} certificates remaining
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Recent Batches */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Batches
            </Typography>
            <IconButton onClick={fetchBatches} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Batch ID</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Counts</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      {batch.course_code || 'All Courses'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={batch.status} 
                        color={getStatusColor(batch.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip label={`Q:${batch.counts.queued}`} size="small" />
                        <Chip label={`E:${batch.counts.exported}`} size="small" />
                        <Chip label={`M:${batch.counts.mailed}`} size="small" />
                        <Chip label={`V:${batch.counts.void}`} size="small" />
                        <Chip label={`R:${batch.counts.reprint}`} size="small" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(batch.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {batch.status === 'exported' && (
                          <>
                            <Tooltip title="Download ZIP">
                              <IconButton 
                                onClick={() => handleDownload(batch.id)}
                                size="small"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reconcile">
                              <IconButton 
                                onClick={() => handleReconcile(batch)}
                                size="small"
                              >
                                <UploadIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Button
                          size="small"
                          onClick={() => router.push(`/admin/fulfillment/batches/${batch.id}`)}
                        >
                          View
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      {/* Reconcile Dialog */}
      <Dialog 
        open={reconcileDialogOpen} 
        onClose={() => setReconcileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reconcile Batch</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload reconciliation files for batch {selectedBatch?.id.slice(0, 8)}...
          </Typography>
          
          <TextField
            type="file"
            inputProps={{ accept: '.csv' }}
            label="mailed.csv"
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <TextField
            type="file"
            inputProps={{ accept: '.csv' }}
            label="exceptions.csv (optional)"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReconcileDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Upload & Reconcile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
