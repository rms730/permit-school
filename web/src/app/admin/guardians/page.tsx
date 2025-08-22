'use client';

import {
  Refresh,
  Send,
  Cancel,
  Download,
  FilterList
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';

interface GuardianRequest {
  id: string;
  student_id: string;
  course_id: string;
  guardian_name: string;
  guardian_email: string;
  status: 'pending' | 'verified' | 'expired' | 'canceled';
  created_at: string;
  expires_at: string;
  verified_at?: string;
  courses: {
    title: string;
    j_code: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminGuardiansPage() {
  const [requests, setRequests] = useState<GuardianRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [studentIdFilter, setStudentIdFilter] = useState<string>('');

  // Actions
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (studentIdFilter) params.append('student_id', studentIdFilter);

      const response = await fetch(`/api/admin/guardian/requests?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guardian requests');
      }

      const data = await response.json();
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load guardian requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, studentIdFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResend = async (requestId: string) => {
    setResendingId(requestId);
    try {
      const response = await fetch('/api/admin/guardian/requests/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      });

      if (!response.ok) {
        throw new Error('Failed to resend request');
      }

      setSnackbar({
        open: true,
        message: 'Guardian request resent successfully',
        severity: 'success'
      });
      
      // Refresh the list
      fetchRequests();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to resend request',
        severity: 'error'
      });
    } finally {
      setResendingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setCancelingId(requestId);
    try {
      const response = await fetch('/api/guardian/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      setSnackbar({
        open: true,
        message: 'Guardian request canceled successfully',
        severity: 'success'
      });
      
      // Refresh the list
      fetchRequests();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to cancel request',
        severity: 'error'
      });
    } finally {
      setCancelingId(null);
    }
  };

  const handleDownload = async (requestId: string) => {
    setDownloadingId(requestId);
    try {
      // This would need to be implemented to get the signed URL for the PDF
      // For now, we'll just show a message
      setSnackbar({
        open: true,
        message: 'PDF download feature coming soon',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to download PDF',
        severity: 'error'
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning' as const, label: 'Pending' },
      verified: { color: 'success' as const, label: 'Verified' },
      expired: { color: 'error' as const, label: 'Expired' },
      canceled: { color: 'default' as const, label: 'Canceled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value, 10),
      page: 1 
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Guardian Consent Requests
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Student ID"
            value={studentIdFilter}
            onChange={(e) => setStudentIdFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRequests}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Guardian</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No guardian requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {request.profiles.first_name} {request.profiles.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.profiles.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.courses.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.courses.j_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {request.guardian_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.guardian_email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(request.status)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.expires_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {request.verified_at ? (
                        <Typography variant="body2">
                          {new Date(request.verified_at).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {request.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleResend(request.id)}
                              disabled={resendingId === request.id}
                            >
                              {resendingId === request.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Send />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleCancel(request.id)}
                              disabled={cancelingId === request.id}
                            >
                              {cancelingId === request.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Cancel />
                              )}
                            </IconButton>
                          </>
                        )}
                        {request.status === 'verified' && (
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(request.id)}
                            disabled={downloadingId === request.id}
                          >
                            {downloadingId === request.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Download />
                            )}
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
