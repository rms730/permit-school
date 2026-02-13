"use client";

import { 
  CheckCircle as VerifiedIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  PersonAdd as AddedIcon
} from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  Paper,
  Stack
} from '@mui/material';
import { forwardRef } from 'react';

interface ConsentEvent {
  id: string;
  type: 'added' | 'email_sent' | 'verified' | 'expired' | 'revoked';
  timestamp: string;
  description: string;
  details?: string;
}

interface ConsentStatusTimelineProps {
  events: ConsentEvent[];
  childName?: string;
}

export const ConsentStatusTimeline = forwardRef<HTMLDivElement, ConsentStatusTimelineProps>(
  ({ events, childName }, ref) => {
    const getEventIcon = (type: ConsentEvent['type']) => {
      switch (type) {
        case 'added': return <AddedIcon />;
        case 'email_sent': return <EmailIcon />;
        case 'verified': return <VerifiedIcon />;
        case 'expired': return <ErrorIcon />;
        case 'revoked': return <ErrorIcon />;
        default: return <PendingIcon />;
      }
    };

    const getEventColor = (type: ConsentEvent['type']) => {
      switch (type) {
        case 'verified': return 'success';
        case 'added': return 'primary';
        case 'email_sent': return 'info';
        case 'expired': return 'error';
        case 'revoked': return 'error';
        default: return 'default';
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    if (events.length === 0) {
      return (
        <Box ref={ref} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No consent events found
          </Typography>
        </Box>
      );
    }

    return (
      <Box ref={ref}>
        {childName && (
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Consent Timeline for {childName}
          </Typography>
        )}
        
        <Stack spacing={2}>
          {events.map((event, index) => (
            <Paper key={event.id} elevation={1} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${getEventColor(event.type)}.main`,
                  color: `${getEventColor(event.type)}.contrastText`
                }}>
                  {getEventIcon(event.type)}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {formatDate(event.timestamp)}
                  </Typography>
                  <Typography variant="h6" component="span">
                    {event.description}
                  </Typography>
                  {event.details && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {event.details}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }
);

ConsentStatusTimeline.displayName = 'ConsentStatusTimeline';
