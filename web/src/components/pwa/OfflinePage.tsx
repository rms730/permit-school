"use client";

import { 
  WifiOff as OfflineIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Paper,
  Container,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { forwardRef } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { StatusChip } from '@/components/ui/StatusChip';

interface OfflinePageProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHomeButton?: boolean;
  showOfflineContent?: boolean;
}

export const OfflinePage = forwardRef<HTMLDivElement, OfflinePageProps>(
  ({ 
    title = "You're offline",
    description = "Please check your internet connection and try again.",
    showRetry = true,
    showHomeButton = true,
    showOfflineContent = true,
  }, ref) => {
    const theme = useTheme();

    const handleRetry = () => {
      window.location.reload();
    };

    const offlineContent = [
      {
        title: "Practice Tests",
        description: "Continue with your saved practice tests",
        icon: <SchoolIcon />,
        action: "View Progress",
        href: "/offline/practice"
      },
      {
        title: "Study Materials",
        description: "Access downloaded course materials",
        icon: <SchoolIcon />,
        action: "Study Offline",
        href: "/offline/study"
      }
    ];

    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box ref={ref}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 3 
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'warning.main',
                color: 'warning.contrastText'
              }}>
                <OfflineIcon sx={{ fontSize: 40 }} />
              </Box>
            </Box>
            
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
              {title}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {description}
            </Typography>
            
            <StatusChip 
              status="warning" 
              label="Offline Mode" 
              size="medium"
            />
          </Box>

          {/* Actions */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              {showRetry && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetry}
                >
                  Try Again
                </Button>
              )}
              
              {showHomeButton && (
                <Button
                  component={Link}
                  href="/"
                  variant="outlined"
                  size="large"
                  startIcon={<HomeIcon />}
                >
                  Go Home
                </Button>
              )}
            </Stack>
          </Box>

          {/* Offline Content */}
          {showOfflineContent && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
                Available Offline
              </Typography>
              
              <Stack spacing={3}>
                {offlineContent.map((item, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 3 }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }}>
                        {item.icon}
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                      
                      <Button
                        component={Link}
                        href={item.href}
                        variant="outlined"
                        size="small"
                      >
                        {item.action}
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Help Text */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Need help? Check your internet connection or contact support.
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }
);

OfflinePage.displayName = 'OfflinePage';
