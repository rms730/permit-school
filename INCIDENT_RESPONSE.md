---
title: "Incident Response Runbook"
owner: "Operations"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/RUNBOOKS.md>
  - </docs/SECURITY_COMPLIANCE.md>
---

# Incident Response Runbook

**Purpose & Outcome**  
Comprehensive incident response procedures for Permit School. This runbook provides step-by-step guidance for detecting, responding to, and resolving incidents while maintaining service availability and data integrity.

## Prerequisites

- ✅ Access to production environment
- ✅ Admin credentials for all systems
- ✅ Communication channels established
- ✅ Escalation contacts documented

## Incident Classification

### Severity Levels

| Level  | Description                           | Response Time | Example                                      |
| ------ | ------------------------------------- | ------------- | -------------------------------------------- |
| **P0** | Critical - Complete service outage    | 15 minutes    | Site completely down, data loss              |
| **P1** | High - Major functionality broken     | 30 minutes    | Users can't complete courses, billing broken |
| **P2** | Medium - Minor functionality affected | 2 hours       | Slow performance, non-critical features down |
| **P3** | Low - Cosmetic issues, minor bugs     | 24 hours      | UI glitches, non-blocking issues             |

### Impact Assessment

**User Impact**:

- **High**: Users cannot access core functionality
- **Medium**: Users experience degraded service
- **Low**: Minor inconvenience or cosmetic issues

**Business Impact**:

- **High**: Revenue loss, compliance violations
- **Medium**: Operational inefficiency
- **Low**: Minor operational impact

## Response Procedures

### P0 - Critical Incident

**Immediate Actions** (0-15 minutes):

1. **Acknowledge Incident**

   ```bash
   # Check system status
   curl https://your-domain.com/api/health

   # Check Supabase status
   curl https://your-project.supabase.co/rest/v1/
   ```

2. **Page On-Call Engineer**

   - Send immediate page to on-call engineer
   - Include incident details and severity level
   - Request immediate response

3. **Initial Assessment**

   ```bash
   # Check application logs
   # Supabase Dashboard → Logs
   # Vercel Dashboard → Functions → Logs

   # Check database connectivity
   supabase status
   ```

4. **Communication**
   - Update status page immediately
   - Send initial notification to stakeholders
   - Create incident ticket

**Escalation** (15-30 minutes):

- Escalate to engineering lead if no response
- Escalate to CTO if still no response
- Consider external support if needed

### P1 - High Priority Incident

**Immediate Actions** (0-30 minutes):

1. **Investigate Root Cause**

   ```bash
   # Check recent deployments
   # Vercel Dashboard → Deployments

   # Check database performance
   # Supabase Dashboard → Database → Performance

   # Check error rates
   # Sentry Dashboard → Issues
   ```

2. **Implement Workaround**

   - Deploy hotfix if possible
   - Enable maintenance mode if needed
   - Redirect traffic if applicable

3. **Monitor Impact**
   - Track user experience metrics
   - Monitor error rates
   - Check business metrics

### P2/P3 - Medium/Low Priority

**Standard Response**:

1. Acknowledge within SLA timeframe
2. Investigate during business hours
3. Deploy fix in next regular release
4. Update stakeholders as needed

## Common Incident Scenarios

### Database Issues

**Symptoms**:

- 500 errors on API endpoints
- Database connection timeouts
- RLS policy errors

**Response**:

```bash
# 1. Check Supabase status
supabase status

# 2. Check database performance
# Supabase Dashboard → Database → Performance

# 3. Check recent migrations
supabase migration list

# 4. Rollback if needed
supabase db reset --linked
```

**Verification**:

```bash
# Test database connectivity
curl -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/profiles?select=count
```

### Authentication Issues

**Symptoms**:

- Users can't log in
- Session errors
- OAuth failures

**Response**:

```bash
# 1. Check Supabase Auth status
# Supabase Dashboard → Authentication → Users

# 2. Check OAuth providers
# Supabase Dashboard → Authentication → Providers

# 3. Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Verification**:

```bash
# Test authentication endpoint
curl -X POST https://your-domain.com/api/auth/profile
```

### Payment/Billing Issues

**Symptoms**:

- Stripe webhook failures
- Subscription errors
- Payment processing issues

**Response**:

```bash
# 1. Check Stripe dashboard
# Stripe Dashboard → Events → Webhooks

# 2. Check webhook logs
# Vercel Dashboard → Functions → Logs

# 3. Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

**Verification**:

```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/billing/webhook \
  -H "Stripe-Signature: test" \
  -d '{"type":"test"}'
```

### Performance Issues

**Symptoms**:

- Slow page loads
- Timeout errors
- High response times

**Response**:

```bash
# 1. Check Vercel performance
# Vercel Dashboard → Analytics → Performance

# 2. Check database queries
# Supabase Dashboard → Database → Logs

# 3. Check external services
curl https://api.openai.com/v1/models
```

**Verification**:

```bash
# Test performance
curl -w "@curl-format.txt" https://your-domain.com/api/health
```

## Communication Procedures

### Internal Communication

**Slack Channels**:

- `#incidents` - Primary incident channel
- `#engineering` - Technical discussion
- `#operations` - Operational updates

**Status Page Updates**:

1. **Investigating** - Issue identified, working on resolution
2. **Identified** - Root cause found, implementing fix
3. **Monitoring** - Fix deployed, monitoring for resolution
4. **Resolved** - Issue resolved, normal operations restored

### External Communication

**Customer Updates**:

- Email notifications for P0/P1 incidents
- Status page updates for all incidents
- Social media updates for major incidents

**Stakeholder Updates**:

- Executive summary for P0/P1 incidents
- Detailed report within 24 hours
- Lessons learned within 1 week

## Rollback Procedures

### Code Rollback

```bash
# 1. Identify problematic deployment
# Vercel Dashboard → Deployments

# 2. Rollback to previous version
# Vercel Dashboard → Deployments → Rollback

# 3. Verify rollback
curl https://your-domain.com/api/health
```

### Database Rollback

```bash
# 1. Check migration status
supabase migration list

# 2. Rollback specific migration
supabase db reset --linked

# 3. Verify database state
supabase db diff
```

### Configuration Rollback

```bash
# 1. Revert environment variables
# Vercel Dashboard → Settings → Environment Variables

# 2. Revert feature flags
# Database → jurisdiction_configs table

# 3. Verify configuration
curl https://your-domain.com/api/health
```

## Post-Incident Procedures

### Incident Review

**Within 24 hours**:

1. Schedule post-incident review
2. Document timeline and actions taken
3. Identify root cause
4. List lessons learned

**Within 1 week**:

1. Complete incident report
2. Implement preventive measures
3. Update runbooks and procedures
4. Share learnings with team

### Documentation

**Incident Report Template**:

```markdown
# Incident Report: [Title]

## Summary

Brief description of the incident

## Timeline

- [Time] - Incident detected
- [Time] - Response initiated
- [Time] - Root cause identified
- [Time] - Resolution implemented
- [Time] - Service restored

## Root Cause

Detailed analysis of what caused the incident

## Impact

- User impact
- Business impact
- Financial impact

## Actions Taken

List of actions taken during response

## Lessons Learned

What went well and what could be improved

## Preventive Measures

Actions to prevent similar incidents
```

## Monitoring & Alerting

### Key Metrics

**Application Health**:

- Response time < 2 seconds
- Error rate < 1%
- Uptime > 99.9%

**Database Health**:

- Connection pool utilization < 80%
- Query response time < 500ms
- Active connections < 100

**Business Metrics**:

- User registration rate
- Course completion rate
- Payment success rate

### Alerting Rules

**Critical Alerts** (P0):

- Application down
- Database unavailable
- Payment processing failed

**Warning Alerts** (P1):

- High error rate (>5%)
- Slow response time (>5s)
- Database performance degradation

**Info Alerts** (P2/P3):

- Unusual traffic patterns
- Feature usage anomalies
- Security events

## Escalation Contacts

### Primary Contacts

| Role                 | Name   | Contact | Escalation Time |
| -------------------- | ------ | ------- | --------------- |
| **On-Call Engineer** | [Name] | [Phone] | Immediate       |
| **Engineering Lead** | [Name] | [Phone] | 15 minutes      |
| **CTO**              | [Name] | [Phone] | 30 minutes      |

### Secondary Contacts

| Role                  | Name   | Contact | Escalation Time |
| --------------------- | ------ | ------- | --------------- |
| **DevOps Engineer**   | [Name] | [Phone] | 1 hour          |
| **Security Engineer** | [Name] | [Phone] | 1 hour          |
| **Legal/Compliance**  | [Name] | [Phone] | 2 hours         |

## Tools & Resources

### Monitoring Tools

- **Vercel Analytics** - Application performance
- **Supabase Dashboard** - Database monitoring
- **Sentry** - Error tracking
- **Stripe Dashboard** - Payment monitoring
- **Status Page** - Public status updates

### Access Credentials

**Production Access**:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[redacted]

# Vercel
VERCEL_TOKEN=[redacted]

# Stripe
STRIPE_SECRET_KEY=[redacted]
```

### Useful Commands

```bash
# Health check
curl https://your-domain.com/api/health

# Database status
supabase status

# Recent logs
supabase logs

# Performance test
curl -w "@curl-format.txt" https://your-domain.com/api/health
```

## References

- [Supabase Status Page](https://status.supabase.com/)
- [Vercel Status Page](https://vercel-status.com/)
- [Stripe Status Page](https://status.stripe.com/)
- [OpenAI Status Page](https://status.openai.com/)

---

**Last updated**: 2025-01-27  
**Next review**: 2025-02-27
