# Scripts

This directory contains utility scripts for the permit-school project.

## Environment Seeding

### `seed-env.mjs`

Automatically seeds `.env` files with consistent values across related variables and generates secure tokens/secrets.

**Features:**

- Populates placeholder values with sensible defaults
- **Auto-generates cryptographically secure tokens and secrets**
- Ensures related variables have matching values (e.g., `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_PUBLISHABLE_KEY`)
- Synchronizes values across both root and web `.env.local` files
- Preserves existing values and file structure
- Interactive and non-interactive modes

**Usage:**

```bash
# Interactive mode (prompts for each security token)
node scripts/seed-env.mjs
npm run env:seed

# Non-interactive mode (generates all security tokens automatically)
node scripts/seed-env.mjs --non-interactive
npm run env:seed:auto

# Show help
node scripts/seed-env.mjs --help
```

**Security Token Generation:**
The script can automatically generate secure tokens for:

- `ADMIN_JOB_TOKEN` - Secure admin job authentication
- `BACKGROUND_WORKER_TOKEN` - Background worker authentication
- `REGULATORY_SIGNING_SECRET` - Regulatory document signing
- `FULFILLMENT_HMAC_SECRET` - HMAC secret for fulfillment webhooks
- `MFA_SECRET` - TOTP-compatible MFA secret

**Token Types:**

- **Standard tokens**: 32-byte base64url encoded with descriptive prefixes
- **HMAC secrets**: 64-byte secrets with `hmac_` prefix
- **MFA secrets**: 20-byte base32 encoded (TOTP compatible)

**What it does:**

1. Prompts user for security token generation (or auto-generates in non-interactive mode)
2. Seeds default values for local development
3. Syncs related variables within each file
4. Cross-synchronizes values between root and web `.env.local` files
5. Preserves comments and file structure

**Variable Mappings:**

- `NEXT_PUBLIC_SUPABASE_URL` ↔ `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ↔ `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ↔ `STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_BASE_URL` ↔ `APP_BASE_URL`
- `NEXT_PUBLIC_SITE_URL` ↔ `BASE_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL` ↔ `SUPPORT_EMAIL`
- `NEXT_PUBLIC_SENTRY_DSN` ↔ `SENTRY_DSN`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` ↔ `GOOGLE_CLIENT_ID`

**Customization:**
Edit the `SEED_VALUES` object in `scripts/seed-env.mjs` to customize default values for your environment.

**Safety:**

- Never commits real API keys to version control
- Only modifies existing `.env.local` files
- Preserves all comments and structure
- Provides clear feedback on what was changed
- Generates cryptographically secure tokens using Node.js crypto module
