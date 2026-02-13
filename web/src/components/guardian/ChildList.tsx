"use client";

import { 
  Person as PersonIcon,
  School as SchoolIcon,
  CheckCircle as VerifiedIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  Chip,
  Stack,
  Button,
  useTheme
} from '@mui/material';
import { forwardRef, useState, useEffect } from 'react';

import { useSnack } from '@/app/providers/SnackbarProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonX } from '@/components/ui/SkeletonX';
import { StatusChip } from '@/components/ui/StatusChip';

interface Child {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  consentStatus: 'pending' | 'verified' | 'expired' | 'revoked';
  lastActive?: string;
  progress?: {
    totalProgress: number;
    currentUnit?: string;
    seatTime: number;
  };
}

interface ChildListProps {
  guardianId?: string;
  showActions?: boolean;
}

export const ChildList = forwardRef<HTMLDivElement, ChildListProps>(
  ({ guardianId, showActions = true }, ref) => {
    const theme = useTheme();
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { error: showError } = useSnack();

    useEffect(() => {
      loadChildren();
    }, [guardianId]);

    const loadChildren = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/guardian/children');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load children');
        }

        setChildren(data.children || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load children';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const getConsentStatusColor = (status: Child['consentStatus']) => {
      switch (status) {
        case 'verified': return 'success';
        case 'pending': return 'warning';
        case 'expired': return 'error';
        case 'revoked': return 'error';
        default: return 'default';
      }
    };

    const getConsentStatusIcon = (status: Child['consentStatus']) => {
      switch (status) {
        case 'verified': return <VerifiedIcon />;
        case 'pending': return <PendingIcon />;
        case 'expired': return <ErrorIcon />;
        case 'revoked': return <ErrorIcon />;
        default: return <PersonIcon />;
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const formatAge = (dateOfBirth: string) => {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    };

    if (loading) {
      return <SkeletonX variant="list" lines={3} />;
    }

    if (error) {
      return (
        <ErrorState
          message={error}
          retry={loadChildren}
        />
      );
    }

    if (children.length === 0) {
      return (
        <EmptyState
          title="No children found"
          description="You haven't added any children to your account yet."
          icon={<PersonIcon />}
          primaryAction={{
            label: "Add Child",
            onClick: () => {
              // This would typically open the AddChildDialog
              console.log("Add child clicked");
            }
          }}
        />
      );
    }

    return (
      <Box ref={ref}>
        <List>
          {children.map((child) => (
            <Box key={child.id} sx={{ mb: 2 }}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {child.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({formatAge(child.dateOfBirth)} years old)
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {child.email}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                                             <StatusChip
                         status={getConsentStatusColor(child.consentStatus) as any}
                         label={child.consentStatus}
                       />
                      
                      {child.progress && (
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(child.progress.totalProgress)}% complete
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  
                  {showActions && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SchoolIcon />}
                        onClick={() => {
                          // Navigate to child's dashboard
                          window.location.href = `/guardian/child/${child.id}`;
                        }}
                      >
                        View Progress
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Box>
          ))}
        </List>
      </Box>
    );
  }
);

ChildList.displayName = 'ChildList';
