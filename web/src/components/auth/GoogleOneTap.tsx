"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function GoogleOneTap({ onSuccess, onError }: GoogleOneTapProps) {
  const router = useRouter();
  const oneTapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load if Google One-Tap is enabled
    if (process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP !== '1') {
      return;
    }

    // Check if Google script is loaded
    if (!window.google?.accounts?.id) {
      console.warn('Google One-Tap not available');
      return;
    }

    const handleCredentialResponse = async (response: any) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
        await signInWithGoogle(`${baseUrl}/auth/callback`);
        onSuccess?.();
        router.refresh();
      } catch (error) {
        console.error('Google One-Tap sign-in error:', error);
        onError?.(error);
      }
    };

    // Initialize Google One-Tap
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      prompt_parent_id: oneTapRef.current?.id,
    });

    // Show the One-Tap prompt
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One-Tap is not displayed or skipped
        console.log('Google One-Tap not displayed:', notification.getNotDisplayedReason());
      }
    });

    // Cleanup
    return () => {
      // Note: Google One-Tap doesn't have a cancel method in the current API
      // The prompt will automatically disappear when the component unmounts
    };
  }, [router, onSuccess, onError]);

  // Don't render anything if One-Tap is disabled
  if (process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP !== '1') {
    return null;
  }

  return (
    <div 
      ref={oneTapRef}
      id="google-one-tap-container"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
      }}
    />
  );
}
