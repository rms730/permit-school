import '@testing-library/jest-dom';
import 'vitest-axe/extend-expect';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './testServer';

// 1) Supabase auth mock (unit/integration)
let isAuthenticated = true;
let user = { 
  id: 'test-user-id', 
  email: 'test@example.com',
  app_metadata: { role: 'student' }
};

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: isAuthenticated ? user : null }, 
      error: null 
    }),
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: isAuthenticated ? { user } : null }, 
      error: null 
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    // helpers to flip state during tests
    __setAuthState: (next: boolean) => { isAuthenticated = next },
    __setUser: (next: any) => { user = next },
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
};

vi.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabase,
}));

// Export helpers for tests
export const setAuthed = (next: boolean) => mockSupabase.auth.__setAuthState(next);
export const setAuthUser = (next: any) => mockSupabase.auth.__setUser(next);

// 2) MSW strict mode
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// 3) Fail tests on unexpected console.error (Act & a11y)
const origError = console.error;
console.error = (...args: any[]) => {
  const msg = args.join(' ');
  if (/Warning: An update to .* inside a test/.test(msg)) {
    throw new Error(msg);
  }
  origError(...args);
};

// 4) Mock matchMedia for MUI/Responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 5) requestAnimationFrame stubs (for animation-based utilities)
if (!('requestAnimationFrame' in window)) {
  (window as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
}
if (!('cancelAnimationFrame' in window)) {
  (window as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
}

// 6) Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// 7) Mock next/headers for app router APIs
vi.mock('next/headers', () => {
  const cookiesMap = new Map<string, string>();
  return {
    cookies: async () => ({
      get: (k: string) => (cookiesMap.has(k) ? { name: k, value: cookiesMap.get(k)! } : undefined),
      set: (k: string, v: string) => cookiesMap.set(k, v),
      delete: (k: string) => cookiesMap.delete(k),
    }),
    headers: async () => new Map([['x-test', '1']]),
  };
});

// 8) Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// 9) Mock Stripe for billing routes
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      webhooks: {
        constructEvent: vi.fn().mockReturnValue({ type: 'test.event' }),
      },
      customers: {
        create: vi.fn().mockResolvedValue({ id: 'cus_test' }),
        retrieve: vi.fn().mockResolvedValue({ id: 'cus_test' }),
      },
      subscriptions: {
        create: vi.fn().mockResolvedValue({ id: 'sub_test' }),
        retrieve: vi.fn().mockResolvedValue({ id: 'sub_test' }),
      },
      invoices: {
        list: vi.fn().mockResolvedValue({ data: [] }),
      },
      billingPortal: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: 'https://billing.test' }),
        },
      },
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: 'https://checkout.test' }),
        },
      },
    })),
  };
});

// 10) Mock Resend for email functionality
vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn().mockResolvedValue({ id: 'email_test' }),
      },
    })),
  };
});
