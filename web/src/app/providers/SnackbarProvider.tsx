"use client";

import { SnackbarProvider as NotistackProvider, useSnackbar } from 'notistack';
import React, { createContext, useContext } from 'react';

type SnackCtx = { 
  success: (m: string) => void; 
  error: (m: string) => void; 
  info: (m: string) => void; 
  warning: (m: string) => void; 
};

const Ctx = createContext<SnackCtx | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  return (
    <NotistackProvider 
      maxSnack={3} 
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={4000}
    >
      <Ctx.Provider value={useSnackImpl()}>{children}</Ctx.Provider>
    </NotistackProvider>
  );
}

function useSnackImpl(): SnackCtx {
  const { enqueueSnackbar } = useSnackbar();
  return {
    success: (m) => enqueueSnackbar(m, { variant: 'success' }),
    error: (m) => enqueueSnackbar(m, { variant: 'error' }),
    info: (m) => enqueueSnackbar(m, { variant: 'info' }),
    warning: (m) => enqueueSnackbar(m, { variant: 'warning' }),
  };
}

export const useSnack = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSnack must be used within SnackbarProvider");
  return ctx;
};
