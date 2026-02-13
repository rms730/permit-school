"use client";

import { Notifications as NotificationsIcon } from "@mui/icons-material";
import {
  IconButton,
  Badge,
} from "@mui/material";
import * as React from "react";
import { useState, useEffect } from "react";

import { NotificationsDrawer } from "./notifications/NotificationsDrawer";

interface NotificationBellProps {
  onNotificationClick?: (notification: any) => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?limit=1');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleClick = () => {
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
  };

  useEffect(() => {
    // Fetch initial unread count
    fetchUnreadCount();
    
    // Set up polling for unread count
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
        data-testid="notification-bell"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <NotificationsDrawer
        open={drawerOpen}
        onClose={handleClose}
      />
    </>
  );
}
