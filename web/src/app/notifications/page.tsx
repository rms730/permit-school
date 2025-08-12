"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import { useI18n } from "@/lib/i18n/I18nProvider";
import AppShell from "@/components/layout/AppShell";

interface Notification {
  id: string;
  type: string;
  data: any;
  read_at: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const { dict } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=100');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.read_at)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const getNotificationText = (notification: Notification): string => {
    switch (notification.type) {
      case 'seat_time_milestone':
        return dict.notifications.seatTimeMilestone.replace(
          '{minutes}', 
          notification.data.minutes?.toString() || '0'
        );
      case 'quiz_completed':
        return dict.notifications.quizCompleted;
      case 'final_passed':
        return dict.notifications.finalPassed;
      case 'certificate_issued':
        return dict.notifications.certificateIssued;
      case 'guardian_consent_verified':
        return dict.notifications.guardianConsentVerified;
      case 'weekly_digest':
        return dict.notifications.weeklyDigest;
      case 'subscription_activated':
        return dict.notifications.subscriptionActivated;
      default:
        return 'New notification';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read_at;
    if (filter === 'read') return notification.read_at;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <AppShell>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {dict.notifications.title}
          </Typography>
          <Typography>{dict.common.loading}</Typography>
        </Container>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {dict.notifications.title}
          </Typography>
          <Typography color="error">{error}</Typography>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {dict.notifications.title}
        </Typography>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            onClick={markAllAsRead}
            startIcon={<CheckIcon />}
          >
            {dict.notifications.markAllRead}
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All notifications</MenuItem>
            <MenuItem value="unread">Unread only</MenuItem>
            <MenuItem value="read">Read only</MenuItem>
            <MenuItem value="seat_time_milestone">Study milestones</MenuItem>
            <MenuItem value="quiz_completed">Quiz completions</MenuItem>
            <MenuItem value="final_passed">Final exam results</MenuItem>
            <MenuItem value="certificate_issued">Certificate issuances</MenuItem>
            <MenuItem value="guardian_consent_verified">Guardian consents</MenuItem>
            <MenuItem value="weekly_digest">Weekly digests</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              {dict.notifications.noNotifications}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {filteredNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read_at ? 'inherit' : 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: notification.read_at ? 'normal' : 'bold',
                        }}
                      >
                        {getNotificationText(notification)}
                      </Typography>
                      <Chip
                        label={notification.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={formatDate(notification.created_at)}
                />
                <ListItemSecondaryAction>
                  {!notification.read_at && (
                    <IconButton
                      edge="end"
                      onClick={() => markAsRead([notification.id])}
                      size="small"
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              {index < filteredNotifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
    </AppShell>
  );
}
