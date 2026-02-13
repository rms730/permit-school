"use client";

import { Download as DownloadIcon } from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Stack
} from '@mui/material';
import { forwardRef, useState, useEffect } from 'react';

import { useSnack } from '@/app/providers/SnackbarProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusChip } from '@/components/ui/StatusChip';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'draft' | 'void';
  created: string;
  dueDate?: string;
  pdfUrl?: string;
}

interface InvoiceListProps {
  limit?: number;
  showDownload?: boolean;
}

export const InvoiceList = forwardRef<HTMLDivElement, InvoiceListProps>(
  ({ limit = 10, showDownload = true }, ref) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { error: showError } = useSnack();

    useEffect(() => {
      loadInvoices();
    }, []);

    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/billing/invoices?limit=${limit}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invoices');
        }

        setInvoices(data.invoices || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const handleDownload = async (invoiceId: string) => {
      try {
        const response = await fetch(`/api/billing/invoices/${invoiceId}/download`);
        
        if (!response.ok) {
          throw new Error('Failed to download invoice');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice';
        showError(errorMessage);
      }
    };

    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100); // Assuming amount is in cents
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return (
        <ErrorState
          message={error}
          retry={loadInvoices}
        />
      );
    }

    if (invoices.length === 0) {
      return (
        <EmptyState
          title="No invoices found"
          description="You don't have any invoices yet."
          icon={<DownloadIcon />}
        />
      );
    }

    return (
      <Box ref={ref}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                {showDownload && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {invoice.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(invoice.created)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={invoice.status} />
                  </TableCell>
                  {showDownload && (
                    <TableCell align="center">
                      {invoice.pdfUrl && (
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(invoice.id)}
                          variant="outlined"
                        >
                          Download
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
);

InvoiceList.displayName = 'InvoiceList';
