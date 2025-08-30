# Environment Configuration

This document describes all environment variables used in the permit-school project, their scopes, and how to configure them for different environments.

## Overview

The project uses `@t3-oss/env-nextjs` and `zod` for environment variable validation, ensuring type safety and runtime validation. Environment variables are categorized as:

- **Server-only**: Variables that should never be exposed to the client
- **Client-exposed**: Variables prefixed with `NEXT_PUBLIC_` that are available in the browser

## Environment Variables

### Server-Only Variables

These variables are only available on the server and are never exposed to the client:

| Variable   | Type   | Required | Description         | Example                             |
| ---------- | ------ | -------- | ------------------- | ----------------------------------- |
| `NODE_ENV` | string | Yes      | Node.js environment | `development`, `production`, `test` |

### Client-Exposed Variables

These variables are prefixed with `NEXT_PUBLIC_` and are available in the browser:

| Variable                             | Type   | Required | Description                   | Example                                   |
| ------------------------------------ | ------ | -------- | ----------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | string | Yes      | Supabase project URL          | `https://xyz.supabase.co`                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | string | Yes      | Supabase anonymous key        | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_ENV`                    | string | Yes      | Environment identifier        | `development`, `staging`, `production`    |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | string | Yes      | Stripe publishable key        | `pk_test_...`                             |
| `NEXT_PUBLIC_SENTRY_DSN`             | string | No       | Sentry DSN for error tracking | `https://...@.../...`                     |
| `NEXT_PUBLIC_SITE_URL`               | string | Yes      | Site URL for canonical links  | `https://permitschool.com`                |
| `NEXT_PUBLIC_GOOGLE_ONE_TAP`         | string | No       | Google One Tap client ID      | `123456789.apps.googleusercontent.com`    |
| `NEXT_PUBLIC_COMMIT_SHA`             | string | No       | Git commit SHA for versioning | `abc123def456`                            |
| `NEXT_PUBLIC_BUILD_AT`               | string | No       | Build timestamp               | `2024-01-01T00:00:00Z`                    |

## Environment Configuration

### Local Development

1. **Copy environment templates**:

   ```bash
   npm run env:copy
   ```

2. **Set up environment files**:

   - Root: `.env.local`, `.env.dev`, `.env.prod`
   - Web: `web/.env.local`, `web/.env.development`, `web/.env.production`

3. **Seed environment variables**:
   ```bash
   npm run env:seed
   ```

### Environment Validation

Validate environment configuration for different environments:

```bash
# Local development
npm run env:check:local

# Development environment
npm run env:check:dev

# Production environment
npm run env:check:prod
```

### Environment Matrix

| Environment            | Local                   | CI                                 | Production                 |
| ---------------------- | ----------------------- | ---------------------------------- | -------------------------- |
| `NODE_ENV`             | `development`           | `test`                             | `production`               |
| `NEXT_PUBLIC_ENV`      | `development`           | `staging`                          | `production`               |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://staging.permitschool.com` | `https://permitschool.com` |
| Database               | Local Supabase          | Test Supabase                      | Production Supabase        |
| Stripe                 | Test mode               | Test mode                          | Live mode                  |
| Sentry                 | Disabled                | Enabled                            | Enabled                    |

## Environment Setup Scripts

### Root Level Scripts

- `env:copy:root` - Copy root environment templates
- `env:copy:web` - Copy web environment templates
- `env:copy` - Copy all environment templates
- `env:seed` - Seed environment variables for local development
- `env:seed:all` - Seed all environment variables
- `env:seed:dry` - Dry run of environment seeding
- `env:seed:prod` - Seed production environment variables
- `env:check:local` - Validate local environment
- `env:check:dev` - Validate development environment
- `env:check:prod` - Validate production environment
- `env:setup` - Interactive environment setup
- `env:setup:dry` - Dry run of environment setup

### CI Environment Setup

The CI pipeline automatically sets up environment variables:

```bash
npm run ci:env
```

This script:

1. Validates required environment variables
2. Sets up test database connections
3. Configures test Stripe keys
4. Sets up Sentry for error tracking

## Environment Variable Sources

### Local Development

Environment variables are loaded from:

1. `.env.local` (highest priority)
2. `.env.development` or `.env.production` based on `NODE_ENV`
3. `.env` (lowest priority)

### Production

Environment variables are set through:

1. **Vercel**: Environment variables in Vercel dashboard
2. **GitHub Actions**: Secrets and variables in repository settings
3. **Supabase**: Environment variables in Supabase dashboard

### CI/CD

Environment variables for CI/CD are configured in:

- `.github/workflows/ci.yml` - Main CI pipeline
- `.github/workflows/docs.yml` - Documentation pipeline
- `tools/env/ci-setup.mjs` - CI environment setup script

## Security Considerations

### Sensitive Data

Never commit sensitive environment variables to version control:

- Database credentials
- API keys
- JWT secrets
- Stripe secret keys

### Environment Variable Validation

The project uses Zod schemas to validate environment variables:

```typescript
// web/src/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    // ... other client variables
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // ... other variables
  },
});
```

### Environment Variable Scoping

- **Server-only**: Use for database connections, API keys, secrets
- **Client-exposed**: Use for public configuration, feature flags, analytics
- **Build-time**: Use for static generation, bundle optimization

## Troubleshooting

### Common Issues

1. **Missing environment variables**:

   ```bash
   npm run env:check:local
   ```

2. **Invalid environment variable types**:
   Check the Zod schema in `web/src/env.ts`

3. **Environment variable not available in client**:
   Ensure the variable is prefixed with `NEXT_PUBLIC_`

4. **Environment variable not available on server**:
   Ensure the variable is not prefixed with `NEXT_PUBLIC_`

### Debugging

Enable environment variable debugging:

```bash
# Check environment variable loading
npm run env:setup:dry

# Validate environment configuration
npm run env:check:dev
```

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [API Routes](./api/ROUTES.md) - API endpoint documentation
- [Testing Strategy](./testing/STRATEGY.md) - Testing environment setup
- [CI/CD](./CI.md) - Continuous integration configuration
