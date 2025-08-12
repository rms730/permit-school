"use client";

import { useEffect, useRef, useCallback } from 'react';

export interface IdleTrackerConfig {
  idleTimeoutMs: number;
  heartbeatIntervalMs: number;
  onIdle?: () => void;
  onActive?: () => void;
  onHeartbeat?: () => void;
}

export interface IdleTrackerState {
  isIdle: boolean;
  lastActivity: Date;
  idleStartTime: Date | null;
}

export class IdleTracker {
  private config: IdleTrackerConfig;
  private state: IdleTrackerState;
  private idleTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isTracking = false;

  constructor(config: IdleTrackerConfig) {
    this.config = config;
    this.state = {
      isIdle: false,
      lastActivity: new Date(),
      idleStartTime: null,
    };
  }

  start(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.resetIdleTimer();
    this.startHeartbeat();
    this.setupEventListeners();
  }

  stop(): void {
    this.isTracking = false;
    this.clearTimers();
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });

    // Handle visibility change (tab switch)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Handle window focus/blur
    window.addEventListener('focus', this.handleActivity);
    window.addEventListener('blur', this.handleInactivity);
  }

  private removeEventListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity);
    });

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleActivity);
    window.removeEventListener('blur', this.handleInactivity);
  }

  private handleActivity = (): void => {
    if (!this.isTracking) return;
    
    this.state.lastActivity = new Date();
    
    if (this.state.isIdle) {
      this.state.isIdle = false;
      this.state.idleStartTime = null;
      this.config.onActive?.();
    }
    
    this.resetIdleTimer();
  };

  private handleInactivity = (): void => {
    if (!this.isTracking) return;
    
    this.state.isIdle = true;
    this.state.idleStartTime = new Date();
    this.config.onIdle?.();
  };

  private handleVisibilityChange = (): void => {
    if (!this.isTracking) return;
    
    if (document.hidden) {
      this.handleInactivity();
    } else {
      this.handleActivity();
    }
  };

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    
    this.idleTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.config.idleTimeoutMs);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(() => {
      this.config.onHeartbeat?.();
    }, this.config.heartbeatIntervalMs);
  }

  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  getState(): IdleTrackerState {
    return { ...this.state };
  }

  isUserIdle(): boolean {
    return this.state.isIdle;
  }
}

// React hook for using the idle tracker
export function useIdleTracker(config: IdleTrackerConfig) {
  const trackerRef = useRef<IdleTracker | null>(null);

  const startTracking = useCallback(() => {
    if (!trackerRef.current) {
      trackerRef.current = new IdleTracker(config);
    }
    trackerRef.current.start();
  }, [config]);

  const stopTracking = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.stop();
    }
  }, []);

  const getState = useCallback(() => {
    return trackerRef.current?.getState() || {
      isIdle: false,
      lastActivity: new Date(),
      idleStartTime: null,
    };
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    startTracking,
    stopTracking,
    getState,
  };
}
