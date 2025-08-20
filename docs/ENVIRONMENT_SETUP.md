## <!-- markdownlint-disable MD025 MD031 MD032 -->

title: "Environment Setup"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:

- </docs/LOCAL_DEVELOPMENT.md>
- </docs/TESTING.md>

---

# Environment Setup Guide

This document provides a complete guide for setting up environment variables across all tiers of the Permit School application.

## Overview

The application uses environment variables at **two distinct levels**:

- **Root level** (`.env.local`) - For scripts, tools, and sensitive server-only operations
- **Web level** (`web/.env.local`) - For the Next.js application (client-safe variables only)

## Environment Tiers

### Local Development

- **Purpose**: Local development and testing
- **Files**: `.env.local` (root), `web/.env.local` (web)
- **Services**: Local Supabase, test Stripe keys, local URLs

### Development/Preview

- **Purpose**: Cloud development and staging environments
- **Files**: `.env.dev` (root), `web/.env.development` (web)
- **Services**: Cloud Supabase, test Stripe keys, preview URLs

### Production

- **Purpose**: Live production environment
- **Files**: `.env.prod` (root), `web/.env.production` (web)
- **Services**: Production Supabase, live Stripe keys, production URLs

## Root vs Web Environment Separation

### Root Environment (`.env.local`)

**Purpose**: Scripts, tools, and server-only operations

- Contains **all** environment variables
- Includes sensitive secrets (service role keys, API secrets)
- Used by build tools, seed scripts, and server-side operations
- **Never** exposed to the client

### Web Environment (`web/.env.local`)

**Purpose**: Next.js application runtime

- Contains **only** client-safe variables
- **Client-exposed** variables must be prefixed with `NEXT_PUBLIC_`
- **Server-only** variables for Next.js API routes and server components
- **Never** contains sensitive secrets without `NEXT_PUBLIC_` prefix

## Source-of-Truth Matrix

| Variable                                      | Scope      | Exposure                                         | Required In                 | Default/Fallback                               | Used In                                                     |
| --------------------------------------------- | ---------- | ------------------------------------------------ | --------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `SUPABASE_URL`                                | root + web | server-only (root), client (web via NEXT_PUBLIC) | local, dev, prod            | `http://127.0.0.1:54321` (local)               | web/src/lib/supabaseClient.ts, web/src/lib/supabaseAdmin.ts |
| `NEXT_PUBLIC_SUPABASE_URL`                    | web        | client (public)                                  | local, dev, prod            | `http://127.0.0.1:54321` (local)               | web/src/lib/supabaseClient.ts, web/src/env.ts               |
| `SUPABASE_SERVICE_ROLE_KEY`                   | root + web | server-only                                      | local, dev, prod            | none                                           | web/src/lib/supabaseAdmin.ts, ops/seed/lib/supabase.ts      |
| `SUPABASE_ANON_KEY`                           | root       | server-only                                      | local, dev, prod            | none                                           | ops/seed/lib/supabase.ts                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`               | web        | client (public)                                  | local, dev, prod            | `local_dev_anon` (local)                       | web/src/lib/supabaseClient.ts, web/src/env.ts               |
| `SUPABASE_FUNCTIONS_URL`                      | web        | server-only                                      | local, dev, prod            | derived from SUPABASE_URL                      | web/src/app/api/tutor/route.ts                              |
| `STRIPE_SECRET_KEY`                           | root + web | server-only                                      | dev, prod                   | `sk_test_...` (dev)                            | web/src/app/api/billing/\*\*                                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`          | web        | client (public)                                  | dev, prod                   | `pk_test_...` (dev)                            | checkout client code                                        |
| `STRIPE_WEBHOOK_SECRET`                       | root + web | server-only                                      | dev, prod                   | `whsec_...`                                    | web/src/app/api/billing/webhook/route.ts                    |
| `RESEND_API_KEY`                              | root + web | server-only                                      | dev, prod                   | `re_test_...` (dev)                            | web/src/lib/email.ts                                        |
| `SENTRY_DSN`                                  | root + web | server-only                                      | dev, prod                   | none                                           | web/sentry.server.config.ts                                 |
| `NEXT_PUBLIC_SENTRY_DSN`                      | web        | client (public)                                  | dev, prod                   | none                                           | web/sentry.client.config.ts                                 |
| `OPENAI_API_KEY`                              | root       | server-only                                      | local (optional), dev, prod | none                                           | content generation scripts                                  |
| `TESTKIT_ON`                                  | root       | server-only                                      | local                       | `true`                                         | test scripts                                                |
| `TESTKIT_TOKEN`                               | root       | server-only                                      | local                       | `dev-super-secret`                             | test scripts                                                |
| `BASE_URL`                                    | root       | server-only                                      | local, dev, prod            | `http://localhost:3000` (local)                | scripts and tools                                           |
| `APP_BASE_URL`                                | root + web | server-only                                      | local, dev, prod            | `http://localhost:3000` (local)                | email templates                                             |
| `NEXT_PUBLIC_SITE_URL`                        | web        | client (public)                                  | local, dev, prod            | `http://localhost:3000` (local)                | metadata, sitemap                                           |
| `NEXT_PUBLIC_ENV`                             | web        | client (public)                                  | local, dev, prod            | `local`                                        | web/src/env.ts                                              |
| `NEXT_PUBLIC_COMMIT_SHA`                      | web        | client (public)                                  | local, dev, prod            | `dev`                                          | version info                                                |
| `NEXT_PUBLIC_BUILD_AT`                        | web        | client (public)                                  | local, dev, prod            | empty                                          | version info                                                |
| `NEXT_PUBLIC_GOOGLE_ONE_TAP`                  | web        | client (public)                                  | local, dev, prod            | `0`                                            | Google auth                                                 |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`                | web        | client (public)                                  | local, dev, prod            | none                                           | Google auth                                                 |
| `NEXT_PUBLIC_SUPPORT_EMAIL`                   | web        | client (public)                                  | local, dev, prod            | none                                           | contact info                                                |
| `NEXT_PUBLIC_SUPPORT_PHONE`                   | web        | client (public)                                  | local, dev, prod            | none                                           | contact info                                                |
| `NEXT_PUBLIC_FULFILLMENT_LOW_STOCK_THRESHOLD` | web        | client (public)                                  | local, dev, prod            | `200`                                          | admin UI                                                    |
| `ADMIN_JOB_TOKEN`                             | root       | server-only                                      | local, dev, prod            | none                                           | admin job security                                          |
| `DUNNING_DAILY_ENABLED`                       | root       | server-only                                      | local, dev, prod            | `true`                                         | billing automation                                          |
| `TRIAL_REMINDERS_ENABLED`                     | root       | server-only                                      | local, dev, prod            | `true`                                         | trial management                                            |
| `REGULATORY_SIGNING_SECRET`                   | root + web | server-only                                      | local, dev, prod            | none                                           | regulatory compliance                                       |
| `REGULATORY_MONTHLY_ENABLED`                  | root       | server-only                                      | local, dev, prod            | `true`                                         | regulatory automation                                       |
| `FINAL_EXAM_NUM_QUESTIONS`                    | root + web | server-only                                      | local, dev, prod            | `30`                                           | exam configuration                                          |
| `FINAL_EXAM_PASS_PCT`                         | root + web | server-only                                      | local, dev, prod            | `0.8`                                          | exam configuration                                          |
| `FINAL_EXAM_MINUTES_REQUIRED`                 | root + web | server-only                                      | local, dev, prod            | `150`                                          | exam configuration                                          |
| `RATE_LIMIT_MAX`                              | root + web | server-only                                      | local, dev, prod            | `60`                                           | API rate limiting                                           |
| `RATE_LIMIT_ON`                               | root + web | server-only                                      | local, dev, prod            | `true`                                         | API rate limiting                                           |
| `RATE_LIMIT_WINDOW_MS`                        | root + web | server-only                                      | local, dev, prod            | `60000`                                        | API rate limiting                                           |
| `FROM_EMAIL`                                  | root + web | server-only                                      | local, dev, prod            | `no-reply@yourdomain.com`                      | email sending                                               |
| `SUPPORT_EMAIL`                               | root + web | server-only                                      | local, dev, prod            | `support@yourdomain.com`                       | email templates                                             |
| `BILLING_SUCCESS_URL`                         | root       | server-only                                      | local, dev, prod            | `http://localhost:3000/billing?status=success` | Stripe redirects                                            |
| `BILLING_CANCEL_URL`                          | root       | server-only                                      | local, dev, prod            | `http://localhost:3000/billing?status=cancel`  | Stripe redirects                                            |
| `STRIPE_PORTAL_RETURN_URL`                    | root       | server-only                                      | local, dev, prod            | `http://localhost:3000/billing`                | Stripe portal                                               |
| `STRIPE_PRICE_ID`                             | root       | server-only                                      | local, dev, prod            | none                                           | fallback pricing                                            |
| `OFFLINE_DEV`                                 | root       | server-only                                      | local                       | `0`                                            | offline mode                                                |
| `CI`                                          | root       | server-only                                      | local, dev, prod            | `false`                                        | CI detection                                                |
| `NODE_ENV`                                    | web        | server-only                                      | local, dev, prod            | `development`                                  | Next.js runtime                                             |
| `TEST_STUDENT_USER`                           | root       | server-only                                      | local                       | JSON test user                                 | E2E testing                                                 |
| `TEST_ADMIN_USER`                             | root       | server-only                                      | local                       | JSON test user                                 | E2E testing                                                 |
| `TEST_MINOR_USER`                             | root       | server-only                                      | local                       | JSON test user                                 | E2E testing                                                 |
| `WEEKLY_DIGEST_ENABLED`                       | root       | server-only                                      | local, dev, prod            | `true`                                         | email automation                                            |
| `FULFILLMENT_ON`                              | root       | server-only                                      | local, dev, prod            | `true`                                         | fulfillment system                                          |
| `FULFILLMENT_HMAC_SECRET`                     | root       | server-only                                      | local, dev, prod            | none                                           | fulfillment security                                        |
| `MFA_SECRET`                                  | root       | server-only                                      | local, dev, prod            | none                                           | MFA configuration                                           |
| `CERT_ISSUER_NAME`                            | root       | server-only                                      | local, dev, prod            | none                                           | certificate generation                                      |
| `CERT_ISSUER_LICENSE`                         | root       | server-only                                      | local, dev, prod            | none                                           | certificate generation                                      |
| `APP_ORIGIN`                                  | root       | server-only                                      | local, dev, prod            | none                                           | app origin                                                  |
| `BACKGROUND_WORKER_TOKEN`                     | root       | server-only                                      | local, dev, prod            | none                                           | background jobs                                             |

## Third-Party Integration Checklists

### Stripe Setup

**Required for**: Billing and subscription management

1. **Create Stripe Account**

   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete business verification

2. **Get API Keys**

   - Dashboard → Developers → API Keys
   - **Test keys** for development: `sk_test_...`, `pk_test_...`
   - **Live keys** for production: `sk_live_...`, `pk_live_...`

3. **Configure Webhooks**

   - Dashboard → Developers → Webhooks
   - **Endpoint URL**: `${BASE_URL}/api/billing/webhook`
   - **Events to listen for**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `payment_method.attached`
   - **Webhook secret**: Copy `whsec_...` to `STRIPE_WEBHOOK_SECRET`

4. **Set Billing URLs**

   - `BILLING_SUCCESS_URL`: `${BASE_URL}/billing?status=success`
   - `BILLING_CANCEL_URL`: `${BASE_URL}/billing?status=cancel`
   - `STRIPE_PORTAL_RETURN_URL`: `${BASE_URL}/billing`

5. **Environment-Specific Configuration**
   - **Local**: Use test keys, localhost URLs
   - **Development**: Use test keys, preview URLs
   - **Production**: Use live keys, production URLs

### Resend Setup

**Required for**: Email delivery

1. **Create Resend Account**

   - Go to [resend.com](https://resend.com) and create an account
   - Verify your email address

2. **Get API Key**

   - Dashboard → API Keys → Create API Key
   - **Test key** for development: `re_test_...`
   - **Live key** for production: `re_live_...`

3. **Verify Domain** (Production only)

   - Dashboard → Domains → Add Domain
   - Follow DNS verification steps
   - Update `FROM_EMAIL` to use verified domain

4. **Environment-Specific Configuration**
   - **Local**: Use test key, any email address
   - **Development**: Use test key, verified domain
   - **Production**: Use live key, verified domain

### Sentry Setup

**Required for**: Error monitoring and performance tracking

1. **Create Sentry Account**

   - Go to [sentry.io](https://sentry.io) and create an account
   - Create a new organization

2. **Create Project**

   - Create a new project for "Next.js"
   - Select "Next.js" as the framework

3. **Get DSNs**

   - Project Settings → Client Keys
   - **Server DSN**: Copy to `SENTRY_DSN`
   - **Public DSN**: Copy to `NEXT_PUBLIC_SENTRY_DSN`

4. **Environment-Specific Configuration**
   - **Local**: Optional, can be empty
   - **Development**: Use project DSNs
   - **Production**: Use project DSNs

### Supabase Setup

**Required for**: Database, authentication, and storage

1. **Create Supabase Project**

   - Go to [supabase.com](https://supabase.com) and create an account
   - Create a new project

2. **Get Project Credentials**

   - Settings → API
   - **Project URL**: Copy to `SUPABASE_URL`
   - **Service Role Key**: Copy to `SUPABASE_SERVICE_ROLE_KEY`
   - **Anon Key**: Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Local Development**

   - Run `supabase start` to start local instance
   - Use local URLs and keys from `supabase status`

4. **Environment-Specific Configuration**
   - **Local**: Use local Supabase instance
   - **Development**: Use development project
   - **Production**: Use production project

## Secrets & Redaction Policy

### Security Rules

1. **Server-only secrets must NEVER appear in web environment files** unless:

   - They are prefixed with `NEXT_PUBLIC_` AND
   - They are intentionally meant for client exposure

2. **Client-exposed variables must be prefixed with `NEXT_PUBLIC_`**

   - This is enforced by Next.js build process
   - Variables without this prefix are server-only

3. **Never commit real secrets to version control**
   - Use `.example` files for templates
   - Use GitHub Secrets for CI/CD
   - Use environment-specific secret management

### Redaction Rules

1. **In documentation and logs, redact secrets by showing only prefixes**:

   - Stripe: `sk_test_...`, `pk_test_...`, `whsec_...`
   - Resend: `re_test_...`, `re_live_...`
   - Supabase: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **In error messages and logs**:
   - Show variable names but not values
   - Use `***configured***` or `***redacted***` for sensitive values

## Setup Instructions

### Quick Start (Local Development)

1. **Copy example files**:

   ```bash
   cp env-examples/root.env.local.example .env.local
   cp env-examples/web.env.local.example web/.env.local
   ```

2. **Start local Supabase**:

   ```bash
   supabase start
   ```

3. **Update root environment**:

   ```bash
   # Copy keys from `supabase status` output
   # Add test Stripe keys from Stripe Dashboard
   # Add test Resend key from Resend Dashboard
   ```

4. **Update web environment**:

   ```bash
   # Copy NEXT_PUBLIC_ keys from root environment
   # Update URLs for local development
   ```

5. **Validate setup**:
   ```bash
   npm run env:check:local
   npm run -w web env:check
   ```

### Development Environment

1. **Create environment files**:

   ```bash
   cp env-examples/root.env.dev.example .env.dev
   cp env-examples/web.env.development.example web/.env.development
   ```

2. **Configure cloud services**:

   - Create development Supabase project
   - Use test Stripe keys
   - Use test Resend keys
   - Use development Sentry project

3. **Validate setup**:
   ```bash
   npm run env:check:dev
   ```

### Production Environment

1. **Create environment files**:

   ```bash
   cp env-examples/root.env.prod.example .env.prod
   cp env-examples/web.env.production.example web/.env.production
   ```

2. **Configure production services**:

   - Use production Supabase project
   - Use live Stripe keys
   - Use live Resend keys
   - Use production Sentry project

3. **Validate setup**:
   ```bash
   npm run env:check:prod
   ```

## Verification Steps

### Local Validation

```bash
# Validate root environment
npm run env:check:local

# Validate web environment
npm run -w web env:check

# Run smoke tests
bash ops/checks/smoke.sh
```

### Development Validation

```bash
# Validate development environment
npm run env:check:dev

# Run build and tests
npm --prefix web run build
npm --prefix web test
```

### Production Validation

```bash
# Validate production environment
npm run env:check:prod

# Run production build
npm --prefix web run build
```

## Troubleshooting

### Common Issues

1. **"Missing required environment variable"**

   - Check that all required variables are set for the current environment
   - Verify variable names match exactly (case-sensitive)
   - Ensure variables are in the correct environment file

2. **"Server-only secret in client environment"**

   - Move server-only variables to root environment
   - Ensure client variables are prefixed with `NEXT_PUBLIC_`
   - Check that web environment only contains client-safe variables

3. **"Invalid environment variable format"**

   - Check URL formats (must be valid URLs)
   - Verify API key formats (check service documentation)
   - Ensure boolean values are `true`/`false` or `1`/`0`

4. **"Environment validation failed"**
   - Run validation with verbose output to see specific errors
   - Check that all required services are configured
   - Verify environment tier matches validation command

### Getting Help

1. **Check the logs** for specific error messages
2. **Run validation commands** to identify missing variables
3. **Compare with example files** to ensure correct format
4. **Review service documentation** for API key formats
5. **Check environment tier** matches your setup

## Related Documentation

- [Local Development Guide](LOCAL_DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security Compliance](SECURITY_COMPLIANCE.md)
- [Billing Lifecycle](BILLING_LIFECYCLE.md)
