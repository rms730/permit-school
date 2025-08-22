"use client";

import { useEffect } from 'react';

import { logOfflineStatus } from '@/lib/offline';

export default function OfflineModeIndicator() {
  useEffect(() => {
    logOfflineStatus();
  }, []);

  return null; // This component doesn't render anything visible
}
