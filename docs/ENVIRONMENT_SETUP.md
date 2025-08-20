<!-- markdownlint-disable MD025 MD031 MD032 -->
---
title: "Environment Setup"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:

  - </docs/LOCAL_DEVELOPMENT.md>
  - </docs/TESTING.md>
---

# Environment Setup

This document describes how to set up and validate environment variables for the Permit School application.

## Environment Files

The application uses environment files at two levels:

### Root Level (for scripts/tools)
- `.env.local` - Local development
- `.env.dev` - Development environment
- `.env.prod` - Production environment

### Web Level (for Next.js app)
- `web/.env.local` - Local development
- `web/.env.development` - Development environment
- `web/.env.production` - Production environment

## Required Environment Variables

### Root Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for content generation
- `BASE_URL` - Base URL for the application
- `TESTKIT_ON` - Enable testkit mode (optional)
- `TESTKIT_TOKEN` - Testkit token (required when TESTKIT_ON=true)

### Web Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (client-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (client-safe)
- `NEXT_PUBLIC_ENV` - Environment identifier (local/development/production)

## Environment Validation

We validate environment variables at **two layers**:

1. **Root (Node scripts)** – `tools/env/check.mjs` using Zod
   - Run locally: `npm run env:check:local`
   - CI (dev): `npm run env:check:dev`
   - CI (prod): `npm run env:check:prod`

2. **Web (Next.js)** – `web/src/env.ts` using `@t3-oss/env-nextjs`
   - Evaluated at build-time via side-effect import in `web/src/app/layout.tsx`.
   - Fails the build if required variables are missing or invalid.
   - Enforces that only `NEXT_PUBLIC_*` vars are exposed to the client.

## Setup Instructions

1. **Copy environment files from examples:**
   ```bash
   npm run env:copy
   ```

2. **Fill in the required values** in the copied `.env.local` files.

3. **Validate your setup:**
   ```bash
   # Validate root environment
   npm run env:check:local
   
   # Validate web environment
   npm run -w web env:check
   ```

## Common Errors

- **Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`** → Add them to `/web/.env.*`.
- **Accidentally using a server secret on the client** → The validator will throw with a helpful message.
- **`TESTKIT_ON=true` without `TESTKIT_TOKEN`** → Root validator requires a token in that case.
- **Production environment using HTTP instead of HTTPS** → Root validator enforces HTTPS for production.

## Security Notes

- Never commit `.env.*` files to version control
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client
- Server-only variables (like `SUPABASE_SERVICE_ROLE_KEY`) are never exposed to the client
- Environment validation runs in CI to catch configuration errors early

## Development Workflow

1. Set up environment variables using the copy commands
2. Run validation to ensure everything is configured correctly
3. Start development server: `npm run dev`
4. Environment validation will run automatically during builds

## CI/CD Integration

The CI pipeline automatically:
1. Creates environment files from examples
2. Overrides with GitHub secrets when available
3. Validates both root and web environments
4. Fails the build if validation fails
