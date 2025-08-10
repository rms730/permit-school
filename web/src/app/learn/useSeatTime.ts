'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSeatTimeProps {
  unitId: string;
  onTimeUpdate?: (timeMs: number) => void;
}

interface UseSeatTimeReturn {
  timeMs: number;
  isTracking: boolean;
  resetTime: () => void;
}

export function useSeatTime({ unitId, onTimeUpdate }: UseSeatTimeProps): UseSeatTimeReturn {
  const [timeMs, setTimeMs] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();
  const inFlightRef = useRef<Promise<void> | null>(null);

  // Check if user is active (visible tab and recent interaction)
  const isUserActive = useCallback(() => {
    if (document.visibilityState !== 'visible') return false;
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    return timeSinceLastActivity < 60000; // 60 seconds
  }, []);

  // Record user activity
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Post seat time to server
  const postSeatTime = useCallback(async (msDelta: number) => {
    if (inFlightRef.current) {
      await inFlightRef.current; // Wait for previous request
    }

    const promise = fetch('/api/progress/seat-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId, msDelta })
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        console.error('Seat time post failed:', error);
      }
    });

    inFlightRef.current = promise;
    await promise;
    inFlightRef.current = null;
  }, [unitId]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);
    recordActivity();

    intervalRef.current = setInterval(() => {
      if (isUserActive()) {
        const delta = 30000; // 30 seconds
        setTimeMs(prev => {
          const newTime = prev + delta;
          onTimeUpdate?.(newTime);
          return newTime;
        });
        
        // Post to server every 60 seconds
        if (timeMs % 60000 < 30000) {
          postSeatTime(60000).catch(console.error);
        }
      }
    }, 30000); // Check every 30 seconds
  }, [isTracking, isUserActive, recordActivity, onTimeUpdate, postSeatTime, timeMs]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Reset time
  const resetTime = useCallback(() => {
    setTimeMs(0);
    onTimeUpdate?.(0);
  }, [onTimeUpdate]);

  // Set up event listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      recordActivity();
      if (!isTracking && isUserActive()) {
        startTracking();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start tracking if user is active
    if (isUserActive()) {
      startTracking();
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isUserActive()) {
        startTracking();
      } else {
        stopTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTracking();
      
      // Post final time on unmount
      if (timeMs > 0) {
        postSeatTime(timeMs).catch(console.error);
      }
    };
  }, [isTracking, isUserActive, recordActivity, startTracking, stopTracking, postSeatTime, timeMs]);

  return {
    timeMs,
    isTracking,
    resetTime
  };
}
