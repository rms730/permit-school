import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider } from '@/app/providers/SnackbarProvider';
import { DialogProvider } from '@/app/providers/DialogProvider';
import MuiProvider from '@/app/providers/MuiProvider';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 1000,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Import auth helpers from setup
import { setAuthed as setAuthedFromSetup, setAuthUser as setAuthUserFromSetup } from './setup';

// Re-export auth helpers
export const setAuthed = setAuthedFromSetup;
export const setAuthUser = setAuthUserFromSetup;

const testTheme = createTheme(); // or import your app theme if available

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/', authed = true }: { route?: string; authed?: boolean } = {},
) {
  setAuthed(authed);

  const queryClient = makeQueryClient();

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>
        <MuiProvider>
          <SnackbarProvider>
            <DialogProvider>
              {children}
            </DialogProvider>
          </SnackbarProvider>
        </MuiProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper }),
    queryClient,
  };
}

export { userEvent };
