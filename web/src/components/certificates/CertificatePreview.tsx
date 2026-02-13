"use client";

import { 
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import { forwardRef, useState } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

interface CertificatePreviewProps {
  certificateId: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  onDownload?: () => void;
  onView?: () => void;
  height?: number | string;
  showActions?: boolean;
}

export const CertificatePreview = forwardRef<HTMLDivElement, CertificatePreviewProps>(
  ({ 
    certificateId,
    pdfUrl,
    thumbnailUrl,
    title = 'Certificate Preview',
    onDownload,
    onView,
    height = 400,
    showActions = true,
  }, ref) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
      if (onDownload) {
        onDownload();
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/certificates/${certificateId}/download`);
        
        if (!response.ok) {
          throw new Error('Failed to download certificate');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to download certificate';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const handleView = () => {
      if (onView) {
        onView();
        return;
      }

      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    };

    if (error) {
      return (
        <ErrorState
          message={error}
          retry={handleDownload}
          size="small"
        />
      );
    }

    if (!pdfUrl && !thumbnailUrl) {
      return (
        <EmptyState
          title="No preview available"
          description="This certificate doesn't have a preview yet."
          icon={<PdfIcon />}
          size="small"
        />
      );
    }

    return (
      <Paper
        ref={ref}
        variant="outlined"
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          
          {showActions && (
            <Stack direction="row" spacing={1}>
              {pdfUrl && (
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={handleView}
                  variant="outlined"
                >
                  View
                </Button>
              )}
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={loading}
                variant="contained"
              >
                {loading ? 'Downloading...' : 'Download'}
              </Button>
            </Stack>
          )}
        </Box>

        {/* Preview Content */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {thumbnailUrl ? (
            <ResponsiveImage
              src={thumbnailUrl}
              alt="Certificate preview"
              width={400}
              height={283}
              ratio={1.414} // A4 ratio
              sx={{
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : pdfUrl ? (
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: 'text.secondary'
            }}>
              <PdfIcon sx={{ fontSize: 64 }} />
              <Typography variant="body2" textAlign="center">
                PDF certificate available
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={handleView}
              >
                View Certificate
              </Button>
            </Box>
          ) : (
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: 'text.secondary'
            }}>
              <ErrorIcon sx={{ fontSize: 64 }} />
              <Typography variant="body2" textAlign="center">
                No preview available
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    );
  }
);

CertificatePreview.displayName = 'CertificatePreview';
