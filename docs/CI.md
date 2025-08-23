# CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment pipeline for the Permit School project.

## Overview

The project uses GitHub Actions for CI/CD with multiple workflows that ensure code quality, run tests, and deploy to various environments.

## Workflows

### Main CI Workflow (`.github/workflows/ci.yml`)

Runs on every push to `main` and pull requests:

- **Linting**: Code formatting, environment validation, shell script checking, SQL linting
- **Testing**: Smoke tests and budget sanity checks  
- **Build**: Basic build verification

### Web Application Workflow (`.github/workflows/web.yml`)

Handles web application specific tasks:

- **Build**: Next.js application build
- **Test**: Unit tests with Vitest
- **Type Check**: TypeScript validation
- **Lint**: ESLint with accessibility rules

### Accessibility Workflow (`.github/workflows/accessibility-ci.yml`)

Dedicated accessibility testing:

- **E2E Tests**: Playwright tests with accessibility assertions
- **Axe Validation**: Automated accessibility scanning
- **Lighthouse CI**: Performance and accessibility scoring

### Background Workers (`.github/workflows/background-workers.yml`)

Manages background job testing and validation.

## Required Secrets and Variables

### GitHub Secrets (Sensitive)

- `SUPABASE_SERVICE_ROLE_KEY`: Database service role key
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `RESEND_API_KEY`: Email service API key
- `SENTRY_DSN`: Error tracking DSN

### GitHub Variables (Non-sensitive)

- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public Stripe key
- `NEXT_PUBLIC_SITE_URL`: Application base URL

## Local CI Testing

Run the full CI pipeline locally:

```bash
# Run complete CI check
npm run ci:local

# Run individual checks
npm run format:check
npm run env:check:dev
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web run test
npm --prefix web run test:e2e
```

## Environment-Specific Commands

### Local Development

```bash
npm run env:check:local
npm --prefix web run dev
```

### Staging/Development

```bash
npm run env:check:dev
npm --prefix web run build
```

### Production

```bash
npm run env:check:prod
npm --prefix web run build
npm --prefix web run start
```

## Troubleshooting CI Failures

### Environment Variable Issues

1. Check `.env` files exist and have required values
2. Validate with `npm run env:check:local`
3. Ensure GitHub secrets/variables are set correctly

### Linting Failures

1. Run `npm run format:fix` to fix formatting issues
2. Fix ESLint errors: `npm --prefix web run lint`
3. Fix TypeScript errors: `npm --prefix web run typecheck`

### Test Failures

1. Run tests locally: `npm --prefix web run test`
2. Check E2E tests: `npm --prefix web run test:e2e`
3. Review test output and fix failing assertions

### SQL Migration Issues

1. Validate SQL syntax: `sqlfluff lint --dialect postgres supabase/migrations/*.sql`
2. Fix with: `sqlfluff fix --dialect postgres supabase/migrations/*.sql`
3. Test migrations locally: `supabase db reset`

## Branch Protection Rules

Configure these branch protection rules for `main`:

1. **Require status checks**: All CI jobs must pass
2. **Require up-to-date branches**: Enforce latest changes
3. **Require linear history**: Prevent merge commits
4. **Include administrators**: Apply rules to all users

## Status Badges

Add these badges to README.md:

```markdown
[![CI](https://github.com/rms730/permit-school/workflows/CI/badge.svg)](https://github.com/rms730/permit-school/actions/workflows/ci.yml)
[![Web](https://github.com/rms730/permit-school/workflows/Web/badge.svg)](https://github.com/rms730/permit-school/actions/workflows/web.yml)
[![Accessibility](https://github.com/rms730/permit-school/workflows/Accessibility/badge.svg)](https://github.com/rms730/permit-school/actions/workflows/accessibility-ci.yml)
```
