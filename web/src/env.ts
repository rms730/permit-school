// web/src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * NOTE:
 * - Put server-only web env (if any) in server Schema — they will never be exposed to the client.
 * - Put client-exposed env (must start with NEXT_PUBLIC_) in client schema.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    // If you ever need server-only web vars, add here. Example:
    // SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
    NEXT_PUBLIC_ENV: z.enum(['local', 'development', 'production']).default('local'),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(10).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_GOOGLE_ONE_TAP: z.string().optional(),
    NEXT_PUBLIC_COMMIT_SHA: z.string().optional(),
    NEXT_PUBLIC_BUILD_AT: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GOOGLE_ONE_TAP: process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP,
    NEXT_PUBLIC_COMMIT_SHA: process.env.NEXT_PUBLIC_COMMIT_SHA,
    NEXT_PUBLIC_BUILD_AT: process.env.NEXT_PUBLIC_BUILD_AT,
  },
  /**
   * We want validation in CI and during builds.
   * Set skipValidation only if you have a very specific reason.
   */
  skipValidation: false,
});
