"use client";

import { 
  Close as CloseIcon,
  MarkEmailRead as MarkReadIcon,
  Notifications as NotificationIcon,
  CheckCircle as ReadIcon,
  RadioButtonUnchecked as UnreadIcon
} from '@mui/icons-material';
import { 
  Drawer, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton,
  IconButton,
  Button,
  Stack,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { forwardRef, useState, useEffect, useCallback } from 'react';

import { useSnack } from '@/app/providers/SnackbarProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read_at: string | null;
  created_at: string;
  link?: string;
}

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
}

const NOTIFICATIONS_PER_PAGE = 20;

export const NotificationsDrawer = forwardRef<HTMLDivElement, NotificationsDrawerProps>(
  ({ open, onClose, anchor = 'right' }, ref) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const { success, error: showError } = useSnack();

    const loadNotifications = useCallback(async (pageNum = 1, append = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);
        
        const response = await fetch(
          `/api/notifications?page=${pageNum}&limit=${NOTIFICATIONS_PER_PAGE}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load notifications');
        }

        const newNotifications = data.notifications || [];
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setHasMore(newNotifications.length === NOTIFICATIONS_PER_PAGE);
        setPage(pageNum);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }, [showError]);

    const markAsRead = async (ids: string[]) => {
      try {
        const response = await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to mark notifications as read');
        }

        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        
        success(`Marked ${ids.length} notification${ids.length > 1 ? 's' : ''} as read`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
        showError(errorMessage);
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

    const handleNotificationClick = async (notification: Notification) => {
      if (!notification.read_at) {
        await markAsRead([notification.id]);
      }
      
      if (notification.link) {
        window.location.href = notification.link;
      }
      
      onClose();
    };

    const handleLoadMore = () => {
      if (!loadingMore && hasMore) {
        loadNotifications(page + 1, true);
      }
    };

    useEffect(() => {
      if (open) {
        loadNotifications();
      }
    }, [open, loadNotifications]);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
      <Drawer
        ref={ref}
        anchor={anchor}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 400,
            maxHeight: '100vh',
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6" component="h2">
              Notifications
              {unreadCount > 0 && (
                <Typography 
                  component="span" 
                  sx={{ 
                    ml: 1, 
                    px: 1, 
                    py: 0.5, 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {unreadCount}
                </Typography>
              )}
            </Typography>
            <Stack direction="row" spacing={1}>
              {unreadCount > 0 && (
                <IconButton 
                  size="small" 
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <MarkReadIcon />
                </IconButton>
              )}
              <IconButton size="small" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <ErrorState
                message={error}
                retry={() => loadNotifications()}
                size="small"
              />
            ) : notifications.length === 0 ? (
              <EmptyState
                title="No notifications"
                description="You're all caught up!"
                icon={<NotificationIcon />}
                size="small"
              />
            ) : (
              <List sx={{ p: 0, height: '100%', overflow: 'auto' }}>
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          py: 2,
                          px: 2,
                          bgcolor: notification.read_at ? 'transparent' : 'action.hover',
                          '&:hover': {
                            bgcolor: notification.read_at ? 'action.hover' : 'action.selected',
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          width: '100%',
                          gap: 1
                        }}>
                          <Box sx={{ mt: 0.5 }}>
                            {notification.read_at ? (
                              <ReadIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            ) : (
                              <UnreadIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight={notification.read_at ? 400 : 600}
                              sx={{ mb: 0.5 }}
                            >
                              {notification.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                            >
                              {formatDate(notification.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))}
                
                {hasMore && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outlined"
                      size="small"
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
    );
  }
);

NotificationsDrawer.displayName = 'NotificationsDrawer';
