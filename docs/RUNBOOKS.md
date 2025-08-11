# Runbooks

## Release to Staging

**Trigger:** Push to `release/**` branch or manual workflow dispatch

**Required Secrets:**
- `STAGING_SUPABASE_ACCESS_TOKEN` - Supabase access token for staging project
- `STAGING_SUPABASE_PROJECT_REF` - Staging project reference ID
- `STAGING_DATABASE_URL` - Direct database connection for staging
- `STAGING_BASE_URL` - Staging environment URL for E2E tests
- `TESTKIT_TOKEN` - Token for E2E test authentication

**Process:**
1. Lint, typecheck, and build web application
2. Run Supabase migrations (`supabase db push`)
3. Execute RLS audit to ensure security compliance
4. Create database backup artifact
5. Run full E2E test suite against staging environment

**Success Criteria:** All steps pass, E2E tests green, backup artifact created

## Promote to Production

**Trigger:** Manual approval after successful staging deployment

**Required Secrets:**
- `PROD_SUPABASE_ACCESS_TOKEN` - Supabase access token for production project
- `PROD_SUPABASE_PROJECT_REF` - Production project reference ID
- `PROD_DATABASE_URL` - Direct database connection for production
- `PROD_BASE_URL` - Production environment URL for smoke tests

**Process:**
1. Manual approval via GitHub Environments protection
2. Run Supabase migrations (`supabase db push`)
3. Execute RLS audit on production database
4. Smoke tests: verify `/api/health` and `/courses` endpoints

**Success Criteria:** All steps pass, smoke tests successful

## Backup & Restore

### Automated Backups
- **When:** Every staging deployment (before E2E tests)
- **Where:** GitHub Actions artifacts (`staging-db-backup`)
- **Format:** PostgreSQL custom format (`.sqlc`)
- **Retention:** GitHub Actions artifact retention policy

### Manual Backup
```bash
# Create backup
DATABASE_URL="your-db-url" bash ops/db/backup.sh

# Restore to local development
DATABASE_URL="your-local-db-url" bash ops/db/restore_local.sh backup-20241201-143022.sqlc
```

### Disaster Recovery
1. Download latest backup artifact from GitHub Actions
2. Restore to staging environment for validation
3. Verify data integrity and application functionality
4. If validation passes, restore to production

## Rotate Secrets

### Supabase
1. Generate new access token in Supabase dashboard
2. Update GitHub repository secrets:
   - `STAGING_SUPABASE_ACCESS_TOKEN`
   - `PROD_SUPABASE_ACCESS_TOKEN`
3. Verify staging deployment works with new token
4. Promote to production

### Stripe
1. Generate new API keys in Stripe dashboard
2. Update environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. Update webhook endpoints if needed
4. Test billing functionality in staging

### Sentry
1. Generate new DSN in Sentry project settings
2. Update environment variables:
   - `SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN` (if using)
3. Verify error reporting works in staging

### Resend (Email)
1. Generate new API key in Resend dashboard
2. Update environment variables:
   - `RESEND_API_KEY`
3. Test email functionality in staging

### Database URLs
1. Rotate database passwords in Supabase
2. Update GitHub secrets:
   - `STAGING_DATABASE_URL`
   - `PROD_DATABASE_URL`
3. Verify database connectivity in staging

## Disaster Recovery Drill

**Purpose:** Validate backup/restore procedures and data integrity

**Frequency:** Quarterly

**Process:**
1. Download latest staging backup artifact
2. Create isolated test environment
3. Restore backup to test environment
4. Run full E2E test suite against restored data
5. Verify all application functionality works
6. Document any issues and update procedures

**Success Criteria:** All tests pass, no data corruption, application fully functional
