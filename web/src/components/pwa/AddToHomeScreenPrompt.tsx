"use client";

import { 
  Close as CloseIcon,
  AddToHomeScreen as InstallIcon,
  PhoneAndroid as PhoneIcon
} from '@mui/icons-material';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  IconButton,
  useTheme,
  Slide
} from '@mui/material';
import { forwardRef, useState, useEffect } from 'react';

interface AddToHomeScreenPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const AddToHomeScreenPrompt = forwardRef<HTMLDivElement, AddToHomeScreenPromptProps>(
  ({ onInstall, onDismiss, position = 'bottom' }, ref) => {
    const theme = useTheme();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        
        // Stash the event so it can be triggered later
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        
        // Show the install prompt
        setShowPrompt(true);
      };

      const handleAppInstalled = () => {
        // Hide the app-provided install promotion
        setShowPrompt(false);
        setDeferredPrompt(null);
        
        // Optionally, send analytics event to track successful installs
        console.log('PWA was installed');
      };

      // Check if the app is already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = (window.navigator as any).standalone === true;
      
      if (!isStandalone && !isInApp) {
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }, []);

    const handleInstall = async () => {
      if (!deferredPrompt) return;

      setIsInstalling(true);

      try {
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          onInstall?.();
        } else {
          console.log('User dismissed the install prompt');
        }
      } catch (error) {
        console.error('Error during install:', error);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    };

    const handleDismiss = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      onDismiss?.();
    };

    if (!showPrompt || !deferredPrompt) {
      return null;
    }

    return (
      <Slide direction={position === 'top' ? 'down' : 'up'} in={showPrompt}>
        <Box
          ref={ref}
          sx={{
            position: 'fixed',
            [position]: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.snackbar + 1,
            p: 2,
            bgcolor: 'background.paper',
            borderTop: position === 'bottom' ? 1 : 0,
            borderBottom: position === 'top' ? 1 : 0,
            borderColor: 'divider',
            boxShadow: theme.shadows[8],
          }}
        >
          <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}>
                  <PhoneIcon />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 0.5 }}>
                    Install Permit School
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add to your home screen for quick access and offline learning
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<InstallIcon />}
                    onClick={handleInstall}
                    disabled={isInstalling}
                    size="small"
                  >
                    {isInstalling ? 'Installing...' : 'Install'}
                  </Button>
                  <IconButton
                    size="small"
                    onClick={handleDismiss}
                    aria-label="Dismiss install prompt"
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Slide>
    );
  }
);

AddToHomeScreenPrompt.displayName = 'AddToHomeScreenPrompt';
