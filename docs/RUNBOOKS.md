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

# Runbooks

This document provides step-by-step procedures for common operational tasks, troubleshooting, and maintenance activities for the permit-school platform.

## Overview

Runbooks are organized by category and provide detailed procedures for:

- **Daily Operations**: Routine tasks and monitoring
- **Deployment**: Application deployment and rollback procedures
- **Troubleshooting**: Common issues and resolution steps
- **Maintenance**: Regular maintenance tasks
- **Emergency Procedures**: Incident response and recovery

## Daily Operations

### Health Check Monitoring

#### Check Application Health

```bash
# Check application status
curl -f http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

#### Monitor Key Metrics

1. **Response Times**: Check API response times
2. **Error Rates**: Monitor error rates in Sentry
3. **Database Performance**: Check Supabase dashboard
4. **User Activity**: Monitor active users and sessions

### Log Monitoring

#### Application Logs

```bash
# Check application logs
npm run logs:app

# Check error logs
npm run logs:errors

# Check performance logs
npm run logs:performance
```

#### Database Logs

```bash
# Check database connection
npm run db:status

# Check slow queries
npm run db:slow-queries

# Check connection pool
npm run db:connections
```

## Deployment Procedures

### Production Deployment

#### Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] Performance tests passing (`npm run lhci`)
- [ ] Security scan completed
- [ ] Database migrations ready
- [ ] Environment variables updated

#### Deployment Steps

1. **Create Release Branch**:

   ```bash
   git checkout -b release/v1.0.0
   git push origin release/v1.0.0
   ```

2. **Run Pre-Deployment Tests**:

   ```bash
   npm run ci:all
   ```

3. **Deploy to Staging**:

   ```bash
   npm run deploy:staging
   ```

4. **Verify Staging**:

   ```bash
   npm run verify:staging
   ```

5. **Deploy to Production**:

   ```bash
   npm run deploy:production
   ```

6. **Verify Production**:
   ```bash
   npm run verify:production
   ```

#### Rollback Procedure

If deployment fails:

1. **Identify Issue**:

   ```bash
   npm run logs:deployment
   ```

2. **Rollback to Previous Version**:

   ```bash
   npm run rollback:production
   ```

3. **Verify Rollback**:

   ```bash
   npm run verify:production
   ```

4. **Investigate and Fix**:
   - Check logs for errors
   - Review configuration changes
   - Test fixes in staging

### Database Migrations

#### Run Migrations

```bash
# Check pending migrations
npm run db:migrations:status

# Run migrations
npm run db:migrations:up

# Verify migrations
npm run db:migrations:verify
```

#### Rollback Migrations

```bash
# Rollback last migration
npm run db:migrations:down

# Rollback specific migration
npm run db:migrations:down --version=20240101000000
```

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptoms**: Application fails to start, port already in use

**Resolution**:

```bash
# Check for running processes
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Restart application
npm run dev
```

#### Database Connection Issues

**Symptoms**: Database connection errors, timeout errors

**Resolution**:

```bash
# Check database status
npm run db:status

# Test connection
npm run db:test

# Check environment variables
npm run env:check:prod

# Restart database connection
npm run db:restart
```

#### API Endpoint Errors

**Symptoms**: 500 errors, API timeouts

**Resolution**:

```bash
# Check API logs
npm run logs:api

# Test specific endpoint
curl -v http://localhost:3000/api/health

# Check rate limiting
npm run logs:rate-limit

# Verify authentication
npm run auth:verify
```

#### Performance Issues

**Symptoms**: Slow response times, high CPU usage

**Resolution**:

```bash
# Check performance metrics
npm run perf:check

# Analyze bundle size
npm run bundle:analyze

# Check database queries
npm run db:slow-queries

# Monitor memory usage
npm run perf:memory
```

### Error Investigation

#### Check Error Logs

```bash
# Check Sentry for errors
npm run logs:sentry

# Check application logs
npm run logs:app --level=error

# Check database errors
npm run logs:db --level=error
```

#### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable specific debug
DEBUG=app:*,db:* npm run dev
```

## Maintenance Tasks

### Regular Maintenance

#### Weekly Tasks

1. **Security Updates**:

   ```bash
   # Update dependencies
   npm run deps:update

   # Check for vulnerabilities
   npm run security:scan

   # Update security patches
   npm run security:update
   ```

2. **Performance Monitoring**:

   ```bash
   # Run performance tests
   npm run perf:test

   # Check Core Web Vitals
   npm run lhci

   # Analyze bundle size
   npm run bundle:analyze
   ```

3. **Database Maintenance**:

   ```bash
   # Check database health
   npm run db:health

   # Optimize queries
   npm run db:optimize

   # Check storage usage
   npm run db:storage
   ```

#### Monthly Tasks

1. **Backup Verification**:

   ```bash
   # Verify backups
   npm run backup:verify

   # Test restore procedure
   npm run backup:test-restore
   ```

2. **Compliance Check**:

   ```bash
   # Check privacy compliance
   npm run compliance:check

   # Verify data retention
   npm run compliance:retention
   ```

3. **Security Audit**:

   ```bash
   # Run security audit
   npm run security:audit

   # Check access logs
   npm run security:access-logs
   ```

### Data Management

#### Data Cleanup

```bash
# Clean old logs
npm run logs:cleanup

# Clean temporary files
npm run temp:cleanup

# Clean old backups
npm run backup:cleanup
```

#### Data Export

```bash
# Export user data
npm run data:export --user=<user-id>

# Export course data
npm run data:export --type=courses

# Export analytics data
npm run data:export --type=analytics
```

## Emergency Procedures

### Incident Response

#### Critical Incident

1. **Immediate Response**:

   ```bash
   # Stop affected services
   npm run service:stop --service=<service-name>

   # Enable maintenance mode
   npm run maintenance:enable

   # Notify team
   npm run notify:incident --severity=critical
   ```

2. **Investigation**:

   ```bash
   # Collect logs
   npm run logs:collect

   # Check system status
   npm run system:status

   # Analyze metrics
   npm run metrics:analyze
   ```

3. **Recovery**:

   ```bash
   # Apply fixes
   npm run fix:apply

   # Restart services
   npm run service:restart

   # Verify recovery
   npm run verify:recovery
   ```

#### Data Breach Response

1. **Containment**:

   ```bash
   # Isolate affected systems
   npm run security:isolate

   # Preserve evidence
   npm run security:preserve-evidence

   # Notify authorities
   npm run security:notify-authorities
   ```

2. **Investigation**:

   ```bash
   # Analyze breach scope
   npm run security:analyze-breach

   # Identify affected users
   npm run security:affected-users

   # Document incident
   npm run security:document-incident
   ```

3. **Recovery**:

   ```bash
   # Patch vulnerabilities
   npm run security:patch

   # Restore from backup
   npm run backup:restore

   # Notify users
   npm run security:notify-users
   ```

### Disaster Recovery

#### System Recovery

```bash
# Check system status
npm run system:status

# Restore from backup
npm run backup:restore --type=full

# Verify system integrity
npm run system:verify

# Restart services
npm run service:restart --all
```

#### Database Recovery

```bash
# Check database status
npm run db:status

# Restore database
npm run db:restore --backup=<backup-id>

# Verify data integrity
npm run db:verify

# Reindex database
npm run db:reindex
```

## Monitoring and Alerting

### Health Checks

#### Application Health

```bash
# Run health checks
npm run health:check

# Check all services
npm run health:check --all

# Check specific service
npm run health:check --service=api
```

#### Database Health

```bash
# Check database health
npm run db:health

# Check connection pool
npm run db:connections

# Check query performance
npm run db:performance
```

### Alerting

#### Configure Alerts

```bash
# Set up monitoring alerts
npm run monitoring:setup

# Configure alert thresholds
npm run monitoring:thresholds

# Test alert system
npm run monitoring:test
```

#### Respond to Alerts

```bash
# Acknowledge alert
npm run alert:acknowledge --id=<alert-id>

# Investigate alert
npm run alert:investigate --id=<alert-id>

# Resolve alert
npm run alert:resolve --id=<alert-id>
```

## Backup and Recovery

### Backup Procedures

#### Create Backup

```bash
# Create full backup
npm run backup:create --type=full

# Create incremental backup
npm run backup:create --type=incremental

# Create database backup
npm run backup:create --type=database
```

#### Verify Backup

```bash
# Verify backup integrity
npm run backup:verify --id=<backup-id>

# Test backup restore
npm run backup:test-restore --id=<backup-id>

# Check backup size
npm run backup:size --id=<backup-id>
```

### Recovery Procedures

#### Full System Recovery

```bash
# Stop all services
npm run service:stop --all

# Restore from backup
npm run backup:restore --id=<backup-id>

# Verify system integrity
npm run system:verify

# Restart services
npm run service:restart --all
```

#### Partial Recovery

```bash
# Restore specific component
npm run backup:restore --component=<component> --id=<backup-id>

# Verify component
npm run component:verify --name=<component>

# Restart component
npm run service:restart --service=<component>
```

## Performance Optimization

### Performance Monitoring

#### Monitor Performance

```bash
# Check Core Web Vitals
npm run perf:web-vitals

# Monitor API performance
npm run perf:api

# Check database performance
npm run perf:database
```

#### Performance Optimization

```bash
# Optimize bundle size
npm run bundle:optimize

# Optimize images
npm run images:optimize

# Optimize database queries
npm run db:optimize-queries
```

### Load Testing

#### Run Load Tests

```bash
# Run load test
npm run load:test --users=100 --duration=300

# Run stress test
npm run load:stress --users=1000 --duration=600

# Run spike test
npm run load:spike --users=500 --duration=60
```

#### Analyze Results

```bash
# Analyze load test results
npm run load:analyze --test=<test-id>

# Generate report
npm run load:report --test=<test-id>

# Compare with baseline
npm run load:compare --baseline=<baseline-id>
```

## Security Procedures

### Security Monitoring

#### Monitor Security

```bash
# Check security logs
npm run security:logs

# Monitor access attempts
npm run security:access

# Check for vulnerabilities
npm run security:scan
```

#### Security Response

```bash
# Block suspicious IP
npm run security:block --ip=<ip-address>

# Investigate security event
npm run security:investigate --event=<event-id>

# Update security rules
npm run security:update-rules
```

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Security & Privacy](./SECURITY_PRIVACY.md) - Security procedures
- [Performance](./PERFORMANCE.md) - Performance optimization
- [Incident Response](./INCIDENT_RESPONSE.md) - Emergency procedures
