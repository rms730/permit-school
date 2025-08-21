# Environment Variables Reference

This document provides a complete reference for all environment variables used in the Permit School application.

## Overview

The application uses environment variables at two levels:

- **Root level** (`.env.local`) - For scripts, tools, and server-side operations
- **Web level** (`web/.env.local`) - For the Next.js application

## Root Environment Variables

### Supabase Configuration

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### OpenAI (Optional)

```bash
OPENAI_API_KEY=sk-proj-your_openai_key
```

### Stripe (Required for billing)

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Email (Resend)

```bash
RESEND_API_KEY=re_your_resend_api_key
```

### Monitoring (Sentry)

```bash
SENTRY_DSN=https://your_sentry_dsn
```

### Testkit (Testing)

```bash
TESTKIT_ON=true
TESTKIT_TOKEN=dev-super-secret
```

### App Configuration

```bash
BASE_URL=http://localhost:3000
CI=false
```

### Regulatory

```bash
REGULATORY_SIGNING_SECRET=your_regulatory_signing_secret
```

### Admin Jobs

```bash
DUNNING_DAILY_ENABLED=true
TRIAL_REMINDERS_ENABLED=true
ADMIN_JOB_TOKEN=your_secure_admin_token
```

### Dunning Configuration

```bash
DUNNING_EMAIL_DAY_1=now
DUNNING_EMAIL_DAY_2=3
DUNNING_EMAIL_DAY_3=7
```

### Billing URLs

```bash
BILLING_SUCCESS_URL=http://localhost:3000/billing?status=success
BILLING_CANCEL_URL=http://localhost:3000/billing?status=cancel
STRIPE_PORTAL_RETURN_URL=http://localhost:3000/billing
```

### Email Configuration

```bash
FROM_EMAIL=no-reply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
APP_BASE_URL=http://localhost:3000
```

### Rate Limiting

```bash
RATE_LIMIT_MAX=60
```

### Final Exam Configuration

> **Note**: These variables are now managed in the database via the `jurisdiction_configs` table. Each jurisdiction can have different values configured through the admin interface at `/admin/jurisdictions`.

```bash
# These are now managed in the database via jurisdiction_configs table
# FINAL_EXAM_NUM_QUESTIONS=30
# FINAL_EXAM_PASS_PCT=0.8
# FINAL_EXAM_MINUTES_REQUIRED=150
```

### Offline Development

```bash
OFFLINE_DEV=0
```

## Web Environment Variables

### Supabase (Client-safe)

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase (Server-only)

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_FUNCTIONS_URL=http://127.0.0.1:54321/functions/v1
```

### Stripe (Client-safe)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### Stripe (Server-only)

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Email (Resend)

```bash
RESEND_API_KEY=re_your_resend_api_key
```

### Monitoring (Sentry)

```bash
SENTRY_DSN=https://your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=https://your_public_sentry_dsn
```

### Environment

```bash
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_COMMIT_SHA=dev
NEXT_PUBLIC_BUILD_AT=
```

### Site Configuration

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Google One Tap (Optional)

```bash
NEXT_PUBLIC_GOOGLE_ONE_TAP=0
```

### Email Configuration

```bash
FROM_EMAIL=no-reply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
APP_BASE_URL=http://localhost:3000
```

### Rate Limiting

```bash
RATE_LIMIT_MAX=60
```

### Final Exam Configuration

> **Note**: These variables are now managed in the database via the `jurisdiction_configs` table. Each jurisdiction can have different values configured through the admin interface at `/admin/jurisdictions`.

```bash
# These are now managed in the database via jurisdiction_configs table
# FINAL_EXAM_NUM_QUESTIONS=30
# FINAL_EXAM_PASS_PCT=0.8
# FINAL_EXAM_MINUTES_REQUIRED=150
```

### Regulatory

```bash
REGULATORY_SIGNING_SECRET=your_regulatory_signing_secret
```

### Admin Jobs

```bash
DUNNING_DAILY_ENABLED=true
TRIAL_REMINDERS_ENABLED=true
ADMIN_JOB_TOKEN=your_secure_admin_token
```

### Dunning Configuration

```bash
DUNNING_EMAIL_DAY_1=now
DUNNING_EMAIL_DAY_2=3
DUNNING_EMAIL_DAY_3=7
```

### Billing URLs

```bash
BILLING_SUCCESS_URL=http://localhost:3000/billing?status=success
BILLING_CANCEL_URL=http://localhost:3000/billing?status=cancel
STRIPE_PORTAL_RETURN_URL=http://localhost:3000/billing
```

### Test Users (E2E Testing)

```bash
TEST_STUDENT_USER={"email":"student@test.com","password":"password123"}
TEST_ADMIN_USER={"email":"admin@test.com","password":"password123"}
TEST_MINOR_USER={"email":"minor@test.com","password":"password123"}
```

### Offline Development

```bash
OFFLINE_DEV=0
```

## Setup Instructions

1. **Copy the example files:**

   ```bash
   cp env-examples/root.env.local.example .env.local
   cp env-examples/web.env.local.example web/.env.local
   ```

2. **Fill in the required values** in both `.env.local` files.

3. **Validate your setup:**
   ```bash
   npm run env:check:local
   npm run -w web env:check
   ```

## Security Notes

- **Never commit `.env.*` files** to version control
- **Only variables prefixed with `NEXT_PUBLIC_`** are exposed to the client
- **Server-only variables** (like `STRIPE_SECRET_KEY`) are never exposed to the client
- **Use test keys** for development and **live keys** for production
- **Environment validation** runs in CI to catch configuration errors early

## Service-Specific Setup

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API Keys
3. Set up webhooks at Dashboard → Developers → Webhooks
4. Use test keys (`sk_test_`, `pk_test_`) for development

### Resend Setup

1. Create a Resend account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your domain for sending emails

### Sentry Setup

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project
3. Get your DSN from Project Settings → Client Keys

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from Settings → API
3. For local development, run `supabase start` to get local keys
