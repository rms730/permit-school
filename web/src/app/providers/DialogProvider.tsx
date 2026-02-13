"use client";

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  DialogContentText,
  Box
} from '@mui/material';
import React, { createContext, useContext, useState } from 'react';

type ConfirmOpts = { 
  title: string; 
  message: string; 
  confirmText?: string; 
  cancelText?: string; 
  destructive?: boolean; 
};

type DialogCtx = { 
  confirm: (o: ConfirmOpts) => Promise<boolean>; 
};

const Ctx = createContext<DialogCtx | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmOpts & { 
    open: boolean; 
    resolve?: (v: boolean) => void 
  }>({ 
    open: false, 
    title: '', 
    message: '' 
  });

  const confirm = (opts: ConfirmOpts) => new Promise<boolean>((resolve) => 
    setState({ open: true, ...opts, resolve })
  );
  
  const close = (v: boolean) => { 
    state.resolve?.(v); 
    setState(s => ({ ...s, open: false })); 
  };

  return (
    <Ctx.Provider value={{ confirm }}>
      {children}
      <Dialog 
        open={state.open} 
        onClose={() => close(false)} 
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="confirm-title">{state.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-message">
            {state.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => close(false)}>
            {state.cancelText ?? 'Cancel'}
          </Button>
          <Button 
            color={state.destructive ? 'error' : 'primary'} 
            variant="contained" 
            onClick={() => close(true)}
            autoFocus
          >
            {state.confirmText ?? 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Ctx.Provider>
  );
}

export const useDialog = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
};
