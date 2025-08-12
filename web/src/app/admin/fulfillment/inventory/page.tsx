'use client';

import { useState, useEffect } from 'react';
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
  Grid
} from '@mui/material';
import {
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface InventoryStatus {
  j_code: string;
  total: number;
  available: number;
  used: number;
  last_used_at: string | null;
}

interface CertificateStock {
  id: number;
  j_code: string;
  serial: string;
  is_used: boolean;
  used_by_certificate: string | null;
  used_at: string | null;
  note: string | null;
  created_at: string;
}

export default function InventoryPage() {
  const [jCode, setJCode] = useState('CA');
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [stock, setStock] = useState<CertificateStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    fetchInventory();
    fetchStock();
  }, [jCode]);

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

  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/admin/fulfillment/stock?j_code=${jCode}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setStock(data.stock || []);
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('serials.csv', uploadFile);
      formData.append('j_code', jCode);

      const response = await fetch('/api/admin/fulfillment/stock/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        fetchInventory();
        fetchStock();
        setUploadDialogOpen(false);
        setUploadFile(null);
      }
    } catch (error) {
      setUploadResult({ error: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleBulkVoid = async (serials: string[]) => {
    if (!confirm(`Are you sure you want to void ${serials.length} certificate serials?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/fulfillment/stock/void', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          j_code: jCode,
          serials
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchInventory();
        fetchStock();
      }
    } catch (error) {
      console.error('Bulk void failed:', error);
    }
  };

  const currentInventory = inventory.find(inv => inv.j_code === jCode);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Certificate Inventory Management
      </Typography>

      {/* Inventory Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Inventory Summary
            </Typography>
            <IconButton onClick={fetchInventory} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
          
          {currentInventory && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Chip 
                  label={`Total: ${currentInventory.total}`}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Chip 
                  label={`Available: ${currentInventory.available}`}
                  color="success"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Chip 
                  label={`Used: ${currentInventory.used}`}
                  color="info"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Chip 
                  label={`Last Used: ${currentInventory.last_used_at ? 
                    new Date(currentInventory.last_used_at).toLocaleDateString() : 'Never'}`}
                  color="default"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Upload Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Upload New Stock
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Serials
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Upload a CSV file with a single column named &quot;serial&quot; containing the certificate serial numbers.
          </Typography>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Certificate Stock
            </Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Jurisdiction</InputLabel>
              <Select
                value={jCode}
                onChange={(e) => setJCode(e.target.value)}
                label="Jurisdiction"
                size="small"
              >
                <MenuItem value="CA">California (CA)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Serial</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Used By</TableCell>
                  <TableCell>Used At</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serial}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.is_used ? 'Used' : 'Available'}
                        color={item.is_used ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.used_by_certificate ? 
                        item.used_by_certificate.slice(0, 8) + '...' : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {item.used_at ? 
                        new Date(item.used_at).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>{item.note || '-'}</TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {!item.is_used && (
                        <Tooltip title="Void Serial">
                          <IconButton 
                            onClick={() => handleBulkVoid([item.serial])}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Certificate Serials</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload a CSV file with certificate serial numbers for {jCode}.
          </Typography>
          
          <TextField
            type="file"
            inputProps={{ accept: '.csv' }}
            label="serials.csv"
            fullWidth
            onChange={(e) => setUploadFile((e.target as HTMLInputElement).files?.[0] || null)}
            sx={{ mb: 2 }}
          />
          
          {uploadResult && (
            <Alert 
              severity={uploadResult.error ? 'error' : 'success'} 
              sx={{ mt: 2 }}
            >
              {uploadResult.error || uploadResult.message || 
                `Upload completed: ${uploadResult.count} serials added`}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
