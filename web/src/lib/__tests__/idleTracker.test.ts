import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { IdleTracker } from '../idleTracker';

describe('IdleTracker', () => {
  let idleTracker: IdleTracker;
  let mockConfig: {
    idleTimeoutMs: number;
    heartbeatIntervalMs: number;
    onIdle: ReturnType<typeof vi.fn>;
    onActive: ReturnType<typeof vi.fn>;
    onHeartbeat: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock timers
    vi.useFakeTimers();
    
    // Mock DOM events
    Object.defineProperty(document, 'addEventListener', {
      value: vi.fn(),
      writable: true,
    });
    
    Object.defineProperty(document, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
    });
    
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true,
    });
    
    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
    });

    mockConfig = {
      idleTimeoutMs: 5000,
      heartbeatIntervalMs: 30000,
      onIdle: vi.fn(),
      onActive: vi.fn(),
      onHeartbeat: vi.fn(),
    };

    idleTracker = new IdleTracker(mockConfig);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const state = idleTracker.getState();
    expect(state.isIdle).toBe(false);
    expect(state.lastActivity).toBeInstanceOf(Date);
    expect(state.idleStartTime).toBeNull();
  });

  it('should start tracking when start() is called', () => {
    idleTracker.start();
    expect(document.addEventListener).toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalled();
  });

  it('should stop tracking when stop() is called', () => {
    idleTracker.start();
    idleTracker.stop();
    expect(document.removeEventListener).toHaveBeenCalled();
    expect(window.removeEventListener).toHaveBeenCalled();
  });

  it('should not start tracking multiple times', () => {
    idleTracker.start();
    idleTracker.start();
    // Should only add event listeners once (6 document events + 2 window events)
    expect(document.addEventListener).toHaveBeenCalledTimes(7); // 6 activity events + 1 visibility change
    expect(window.addEventListener).toHaveBeenCalledTimes(2); // focus + blur
  });

  it('should handle activity events', () => {
    idleTracker.start();
    
    // Simulate user activity
    const mockEvent = new Event('mousemove');
    const handleActivity = (document.addEventListener as any).mock.calls.find(
      (call: [string, EventListener]) => call[0] === 'mousemove'
    )[1];
    
    handleActivity(mockEvent);
    
    const state = idleTracker.getState();
    expect(state.lastActivity).toBeInstanceOf(Date);
  });

  it('should transition to idle state after timeout', () => {
    idleTracker.start();
    
    // Fast-forward time past the idle timeout
    vi.advanceTimersByTime(6000);
    
    expect(mockConfig.onIdle).toHaveBeenCalled();
    
    const state = idleTracker.getState();
    expect(state.isIdle).toBe(true);
    expect(state.idleStartTime).toBeInstanceOf(Date);
  });

  it('should transition back to active state on activity', () => {
    idleTracker.start();
    
    // First, make it idle
    vi.advanceTimersByTime(6000);
    expect(mockConfig.onIdle).toHaveBeenCalled();
    
    // Then simulate activity
    const mockEvent = new Event('mousemove');
    const handleActivity = (document.addEventListener as any).mock.calls.find(
      (call: [string, EventListener]) => call[0] === 'mousemove'
    )[1];
    
    handleActivity(mockEvent);
    
    expect(mockConfig.onActive).toHaveBeenCalled();
    
    const state = idleTracker.getState();
    expect(state.isIdle).toBe(false);
    expect(state.idleStartTime).toBeNull();
  });

  it('should handle visibility change events', () => {
    idleTracker.start();
    
    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      value: true,
      writable: true,
    });
    
    const handleVisibilityChange = (document.addEventListener as any).mock.calls.find(
      (call: [string, EventListener]) => call[0] === 'visibilitychange'
    )[1];
    
    handleVisibilityChange();
    
    expect(mockConfig.onIdle).toHaveBeenCalled();
    
    // Now make it visible again
    Object.defineProperty(document, 'hidden', {
      value: false,
      writable: true,
    });
    
    handleVisibilityChange();
    
    expect(mockConfig.onActive).toHaveBeenCalled();
  });

  it('should send heartbeat at regular intervals', () => {
    idleTracker.start();
    
    // Fast-forward time to trigger heartbeat
    vi.advanceTimersByTime(30000);
    
    expect(mockConfig.onHeartbeat).toHaveBeenCalled();
  });

  it('should return correct idle status', () => {
    expect(idleTracker.isUserIdle()).toBe(false);
    
    idleTracker.start();
    vi.advanceTimersByTime(6000);
    
    expect(idleTracker.isUserIdle()).toBe(true);
  });

  it('should handle window focus/blur events', () => {
    idleTracker.start();
    
    const handleFocus = (window.addEventListener as any).mock.calls.find(
      (call: [string, EventListener]) => call[0] === 'focus'
    )[1];
    
    const handleBlur = (window.addEventListener as any).mock.calls.find(
      (call: [string, EventListener]) => call[0] === 'blur'
    )[1];
    
    // Simulate window blur
    handleBlur();
    expect(mockConfig.onIdle).toHaveBeenCalled();
    
    // Simulate window focus
    handleFocus();
    expect(mockConfig.onActive).toHaveBeenCalled();
  });
});
