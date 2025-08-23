# CI Setup Guide

This document explains how to set up GitHub Actions secrets and variables for the CI pipeline.

## Required GitHub Secrets

Add these secrets in **Settings → Secrets and variables → Actions → Secrets**:

### Supabase (Required)

- `CI_SUPABASE_URL` - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- `CI_SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (starts with `eyJ...`)
- `CI_SUPABASE_ANON_KEY` - Your Supabase anon key (starts with `eyJ...`)

### Testkit (Required)

- `CI_TESTKIT_TOKEN` - Test token for E2E tests (e.g., `dev-super-secret`)

### Stripe (Optional - for billing tests)

- `CI_STRIPE_SECRET_KEY` - Stripe test secret key (starts with `sk_test_...`)
- `CI_STRIPE_PUBLISHABLE_KEY` - Stripe test publishable key (starts with `pk_test_...`)

### Email (Optional - for email tests)

- `CI_RESEND_API_KEY` - Resend API key (starts with `re_...`)

### AI (Optional - for AI features)

- `CI_OPENAI_API_KEY` - OpenAI API key (starts with `sk-...`)

## Required GitHub Variables

Add these variables in **Settings → Secrets and variables → Actions → Variables**:

### Environment

- `NEXT_PUBLIC_ENV` = `ci`
- `NEXT_PUBLIC_SITE_URL` = `http://localhost:4330`

## Test Environment Setup

For local testing with the same environment as CI:

```bash
# Set environment variables
export CI_SUPABASE_URL="your-supabase-url"
export CI_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export CI_SUPABASE_ANON_KEY="your-anon-key"
export CI_TESTKIT_TOKEN="dev-super-secret"
export BASE_URL="http://localhost:4330"
export NEXT_PUBLIC_ENV="ci"
export NEXT_PUBLIC_SITE_URL="http://localhost:4330"

# Run the full CI pipeline locally
npm run ci:all
```

## CI Pipeline Steps

The CI pipeline runs the following steps:

1. **Environment Setup** - Write `.env` files from GitHub secrets
2. **Build** - Build the Next.js application
3. **Start Server** - Start the production server on port 4330
4. **Wait for Ready** - Wait for `/en` endpoint to be available
5. **Lint** - Run ESLint and accessibility linting
6. **Unit Tests** - Run Vitest unit tests
7. **E2E Tests** - Run Playwright E2E tests
8. **Lighthouse CI** - Run performance and accessibility audits

## Troubleshooting

### Missing Environment Variables

If CI fails with "Missing required env vars", add the missing secrets to GitHub.

### Lighthouse NO_FCP Error

This is fixed by waiting for the server to be ready before running Lighthouse CI.

### Test Failures

- Ensure all required secrets are set
- Check that the Supabase project is accessible
- Verify test data can be created via the testkit API

## Local Development

To run the same checks locally:

```bash
# Install dependencies
npm ci
npm --workspace web ci

# Set up environment
npm run ci:env

# Start server and run tests
npm run ci:all
```

This will run the exact same pipeline as GitHub Actions.
