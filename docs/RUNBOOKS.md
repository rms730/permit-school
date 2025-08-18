---
title: "Operational Runbooks"
owner: "Operations"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </INCIDENT_RESPONSE.md>
  - </docs/BILLING_LIFECYCLE.md>
  - </docs/DMV_REPORTING.md>
---

# Operational Runbooks

**Purpose & Outcome**  
Complete operational procedures for Permit School platform management. This runbook provides step-by-step guidance for daily operations, maintenance tasks, and emergency procedures to ensure platform reliability and compliance.

## Prerequisites

- ✅ Admin access to all systems
- ✅ Production environment credentials
- ✅ Communication channels established
- ✅ Monitoring tools configured

## Daily Operations

### Health Check Routine

**Morning Health Check** (9:00 AM daily):

```bash
# 1. Application health
curl https://your-domain.com/api/health
# Expected: {"status":"healthy","environment":"production"}

# 2. Database connectivity
curl -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/profiles?select=count

# 3. Payment processing
# Stripe Dashboard → Events → Recent events

# 4. Email delivery
# Resend Dashboard → Activity → Recent sends
```

**Key Metrics to Monitor**:

- Response time < 2 seconds
- Error rate < 1%
- Database connection pool < 80%
- Payment success rate > 99%

### User Support Procedures

**Common Issues**:

1. **User can't log in**:

   ```bash
   # Check user in Supabase
   # Supabase Dashboard → Authentication → Users
   # Search by email and check status

   # Reset password if needed
   # Supabase Dashboard → Authentication → Users → Reset password
   ```

2. **Course access issues**:

   ```bash
   # Check enrollment status
   # Database → enrollments table
   SELECT * FROM enrollments WHERE user_id = 'user-uuid';

   # Check entitlement status
   # Database → billing_subscriptions table
   SELECT * FROM billing_subscriptions WHERE user_id = 'user-uuid';
   ```

3. **Certificate problems**:

   ```bash
   # Check certificate status
   # Database → certificates table
   SELECT * FROM certificates WHERE user_id = 'user-uuid';

   # Verify certificate PDF
   # Supabase Storage → certificates bucket
   ```

## Weekly Maintenance

### Database Maintenance

**Sunday 2:00 AM**:

```bash
# 1. Check database performance
# Supabase Dashboard → Database → Performance

# 2. Review slow queries
# Supabase Dashboard → Database → Logs

# 3. Check storage usage
# Supabase Dashboard → Storage → Usage

# 4. Backup verification
# Supabase Dashboard → Database → Backups
```

### Security Review

**Monday 10:00 AM**:

```bash
# 1. Review admin access logs
# Supabase Dashboard → Logs → Filter by admin actions

# 2. Check failed login attempts
# Supabase Dashboard → Authentication → Users → Failed attempts

# 3. Review audit log signatures
# Database → audit_logs table
SELECT COUNT(*) FROM audit_logs WHERE NOT verify_audit_signature(id);
```

### Performance Monitoring

**Wednesday 2:00 PM**:

```bash
# 1. Check Vercel performance
# Vercel Dashboard → Analytics → Performance

# 2. Review error rates
# Sentry Dashboard → Issues → Performance

# 3. Monitor external services
curl https://api.openai.com/v1/models
curl https://api.stripe.com/v1/account
```

## Monthly Procedures

### Regulatory Reporting

**First Monday of each month**:

```bash
# 1. Generate DMV reports
# Admin Dashboard → Compliance → Generate Reports

# 2. Verify report integrity
# Check manifest signatures and file hashes

# 3. Submit to regulatory bodies
# Follow jurisdiction-specific submission procedures
```

### Billing Reconciliation

**First Tuesday of each month**:

```bash
# 1. Reconcile Stripe transactions
# Stripe Dashboard → Reports → Transactions

# 2. Verify subscription status
# Database → billing_subscriptions table

# 3. Process dunning escalations
# Check for overdue payments and escalate
```

### Certificate Audit

**First Wednesday of each month**:

```bash
# 1. Audit certificate issuance
# Database → certificates table
SELECT COUNT(*), status FROM certificates
WHERE created_at >= date_trunc('month', now())
GROUP BY status;

# 2. Verify certificate integrity
# Check PDF signatures and QR codes

# 3. Review voided certificates
# Database → certificates table
SELECT * FROM certificates WHERE status = 'voided';
```

## Emergency Procedures

### Database Recovery

**If database becomes unavailable**:

```bash
# 1. Check Supabase status
# https://status.supabase.com/

# 2. Verify connection
supabase status

# 3. Check recent migrations
supabase migration list

# 4. Restore from backup if needed
# Supabase Dashboard → Database → Backups → Restore
```

### Payment System Failure

**If Stripe integration fails**:

```bash
# 1. Check Stripe status
# https://status.stripe.com/

# 2. Verify webhook configuration
# Stripe Dashboard → Developers → Webhooks

# 3. Check webhook logs
# Vercel Dashboard → Functions → Logs

# 4. Manual payment processing if needed
# Stripe Dashboard → Payments → Manual processing
```

### Certificate System Failure

**If certificate generation fails**:

```bash
# 1. Check PDF generation service
# Verify pdf-lib and qrcode dependencies

# 2. Check storage bucket access
# Supabase Dashboard → Storage → certificates bucket

# 3. Manual certificate generation
# Use admin interface to generate certificates manually

# 4. Verify certificate numbers
# Check certificate numbering sequence
```

## Deployment Procedures

### Production Deployment

**Pre-deployment checklist**:

```bash
# 1. Run all tests
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web test
npm --prefix web run test:e2e

# 2. Check environment variables
# Vercel Dashboard → Settings → Environment Variables

# 3. Verify database migrations
supabase migration list

# 4. Check feature flags
# Database → jurisdiction_configs table
```

**Deployment steps**:

```bash
# 1. Deploy to staging
# Vercel Dashboard → Deployments → Deploy

# 2. Run smoke tests
curl https://staging.your-domain.com/api/health

# 3. Deploy to production
# Vercel Dashboard → Deployments → Promote to Production

# 4. Verify deployment
curl https://your-domain.com/api/health
```

### Database Migration

**Safe migration procedure**:

```bash
# 1. Create migration
supabase migration new migration_name

# 2. Test locally
supabase db reset
supabase db push

# 3. Test on staging
supabase db push --linked

# 4. Deploy to production
supabase db push --linked
```

## Monitoring & Alerting

### Key Metrics

**Application Metrics**:

- Response time: < 2 seconds
- Error rate: < 1%
- Uptime: > 99.9%
- User registration rate: Monitor for anomalies

**Database Metrics**:

- Connection pool utilization: < 80%
- Query response time: < 500ms
- Active connections: < 100
- Storage usage: < 80%

**Business Metrics**:

- Course completion rate: Monitor trends
- Payment success rate: > 99%
- Certificate issuance rate: Monitor for spikes
- User engagement: Daily active users

### Alert Thresholds

**Critical Alerts** (P0):

- Application down
- Database unavailable
- Payment processing failed
- Certificate generation failed

**Warning Alerts** (P1):

- High error rate (>5%)
- Slow response time (>5s)
- Database performance degradation
- Payment failure rate > 1%

**Info Alerts** (P2/P3):

- Unusual traffic patterns
- Feature usage anomalies
- Security events
- Performance degradation

## Troubleshooting

### Common Issues

**High Error Rates**:

```bash
# 1. Check Sentry for error details
# Sentry Dashboard → Issues

# 2. Review application logs
# Vercel Dashboard → Functions → Logs

# 3. Check database performance
# Supabase Dashboard → Database → Performance

# 4. Verify external service status
# Check OpenAI, Stripe, Resend status pages
```

**Slow Response Times**:

```bash
# 1. Check Vercel performance
# Vercel Dashboard → Analytics → Performance

# 2. Review database queries
# Supabase Dashboard → Database → Logs

# 3. Check external API calls
# Monitor OpenAI API response times

# 4. Verify CDN performance
# Check Vercel edge network status
```

**Database Connection Issues**:

```bash
# 1. Check Supabase status
supabase status

# 2. Verify connection pool
# Supabase Dashboard → Database → Connection Pool

# 3. Check for long-running queries
# Supabase Dashboard → Database → Logs

# 4. Restart connection pool if needed
# Supabase Dashboard → Database → Connection Pool → Restart
```

## Backup & Recovery

### Backup Procedures

**Daily Backups**:

- Automatic Supabase backups
- Vercel deployment snapshots
- Environment variable backups

**Weekly Backups**:

- Manual database export
- Configuration backup
- Certificate backup

**Monthly Backups**:

- Full system backup
- Disaster recovery test
- Backup integrity verification

### Recovery Procedures

**Database Recovery**:

```bash
# 1. Identify backup point
# Supabase Dashboard → Database → Backups

# 2. Restore database
# Supabase Dashboard → Database → Backups → Restore

# 3. Verify data integrity
# Run data validation queries

# 4. Update application if needed
# Deploy any required code changes
```

**Application Recovery**:

```bash
# 1. Rollback to previous deployment
# Vercel Dashboard → Deployments → Rollback

# 2. Verify application health
curl https://your-domain.com/api/health

# 3. Check functionality
# Test critical user flows

# 4. Monitor for issues
# Watch error rates and performance
```

## Compliance Procedures

### Data Retention

**User Data**:

- Active users: Retain indefinitely
- Inactive users: Retain for 7 years
- Deleted users: Retain certificate numbers only

**Audit Logs**:

- Retain for 7 years
- Tamper-evident signatures
- Immutable storage

**Financial Records**:

- Retain for 7 years
- Stripe transaction history
- Billing audit trail

### Privacy Compliance

**DSAR Processing**:

- Export user data within 30 days
- Delete user data within 30 days
- Maintain audit trail of all requests

**Data Minimization**:

- Only collect necessary data
- Regular data cleanup
- PII scrubbing in logs

**Security Measures**:

- RLS policies on all tables
- Encrypted data at rest
- Secure data transmission

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Incident Response Runbook](INCIDENT_RESPONSE.md)

---

**Last updated**: 2025-01-27  
**Next review**: 2025-02-27
