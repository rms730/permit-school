"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Visibility, CheckCircle, Error } from "@mui/icons-material";
import AppBar from "@/components/AppBar";

interface AuditLog {
  id: number;
  actor_user_id: string;
  actor_role: string;
  action: string;
  object_table: string;
  object_id: string;
  before: any;
  after: any;
  ip: string;
  user_agent: string;
  created_at: string;
  signature: string;
  signature_valid: boolean;
}

interface AuditResponse {
  audit_logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  filters: {
    action: string | null;
    object_table: string | null;
    actor_user_id: string | null;
    start_date: string | null;
    end_date: string | null;
  };
}

export default function AdminAuditPage() {
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    action: "",
    object_table: "",
    actor_user_id: "",
    start_date: "",
    end_date: ""
  });
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    fetchAuditLogs();
  }, [page, rowsPerPage, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });
      
      // Add filters
      if (filters.action) params.append('action', filters.action);
      if (filters.object_table) params.append('object_table', filters.object_table);
      if (filters.actor_user_id) params.append('actor_user_id', filters.actor_user_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const response = await fetch(`/api/admin/audit?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setAuditData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load audit logs');
      }
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDiff = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDiffDialog(true);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'error';
      case 'USER_DELETION': return 'error';
      default: return 'default';
    }
  };

  const formatJson = (data: any) => {
    if (!data) return 'null';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  if (loading && !auditData) {
    return (
      <>
        <AppBar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            Audit Logs
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Action"
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Object Table"
                    value={filters.object_table}
                    onChange={(e) => handleFilterChange('object_table', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Actor User ID"
                    value={filters.actor_user_id}
                    onChange={(e) => handleFilterChange('actor_user_id', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setFilters({
                        action: "",
                        object_table: "",
                        actor_user_id: "",
                        start_date: "",
                        end_date: ""
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audit Logs
                {auditData && (
                  <Chip 
                    label={`${auditData.pagination.total} total`} 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Object</TableCell>
                      <TableCell>Actor</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Signature</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditData?.audit_logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.action} 
                            color={getActionColor(log.action) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.object_table}
                          </Typography>
                          {log.object_id && (
                            <Typography variant="caption" color="text.secondary">
                              ID: {log.object_id}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.actor_role}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.actor_user_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.ip || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {log.signature_valid ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Error color="error" fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Changes">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewDiff(log)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {auditData && (
                <TablePagination
                  component="div"
                  count={auditData.pagination.total}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[25, 50, 100]}
                />
              )}
            </CardContent>
          </Card>
        </Stack>

        {/* Diff Dialog */}
        <Dialog 
          open={showDiffDialog} 
          onClose={() => setShowDiffDialog(false)} 
          maxWidth="lg" 
          fullWidth
        >
          <DialogTitle>
            Audit Log Details
            {selectedLog && (
              <Typography variant="body2" color="text.secondary">
                {selectedLog.action} on {selectedLog.object_table} at {new Date(selectedLog.created_at).toLocaleString()}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">Before</Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        backgroundColor: 'grey.100', 
                        p: 2, 
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        overflow: 'auto',
                        maxHeight: '400px'
                      }}
                    >
                      {formatJson(selectedLog.before)}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">After</Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        backgroundColor: 'grey.100', 
                        p: 2, 
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        overflow: 'auto',
                        maxHeight: '400px'
                      }}
                    >
                      {formatJson(selectedLog.after)}
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider />
                
                <Typography variant="h6">Metadata</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Actor Role</Typography>
                    <Typography variant="body1">{selectedLog.actor_role}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Actor User ID</Typography>
                    <Typography variant="body1">{selectedLog.actor_user_id}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">IP Address</Typography>
                    <Typography variant="body1">{selectedLog.ip || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">User Agent</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {selectedLog.user_agent || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Signature</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                      {selectedLog.signature}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDiffDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
