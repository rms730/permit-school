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
    // Add other client-safe vars here, e.g.:
    // NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(10).optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    // NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
  /**
   * We want validation in CI and during builds.
   * Set skipValidation only if you have a very specific reason.
   */
  skipValidation: false,
});
