# Troubleshooting Guide

This document provides solutions for common issues encountered when working with the permit-school platform, including development, deployment, and production problems.

## Overview

This troubleshooting guide covers:

- **Development Issues**: Local development problems and solutions
- **Build & Deployment**: Build failures and deployment issues
- **Runtime Errors**: Application errors and performance problems
- **Database Issues**: Database connection and query problems
- **Authentication Issues**: Login and authorization problems
- **External Service Issues**: Third-party service integration problems

## Development Issues

### Local Development Setup

#### Node.js Version Issues

**Problem**: Incompatible Node.js version

**Symptoms**:

```
Error: Node.js version 18.x is required, but 16.x is installed
```

**Solution**:

```bash
# Check current version
node --version

# Install correct version (use nvm)
nvm install 20
nvm use 20

# Or use Node Version Manager
n 20
```

#### Package Installation Issues

**Problem**: Failed npm install

**Symptoms**:

```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /path/to/package.json
npm ERR! errno -2
npm ERR! enoent Could not read package.json
```

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If using workspaces
npm install --workspaces
```

#### Environment Variable Issues

**Problem**: Missing or incorrect environment variables

**Symptoms**:

```
Error: Missing required environment variable NEXT_PUBLIC_SUPABASE_URL
```

**Solution**:

```bash
# Copy environment templates
npm run env:copy

# Check environment configuration
npm run env:check:local

# Verify environment variables
npm run env:validate
```

### Development Server Issues

#### Port Already in Use

**Problem**: Development server can't start due to port conflict

**Symptoms**:

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

#### Hot Reload Not Working

**Problem**: Changes not reflected in browser

**Symptoms**: Code changes don't trigger browser refresh

**Solution**:

```bash
# Clear Next.js cache
rm -rf .next

# Restart development server
npm run dev

# Check file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### TypeScript Errors

**Problem**: TypeScript compilation errors

**Symptoms**:

```
Type error: Property 'x' does not exist on type 'y'
```

**Solution**:

```bash
# Check TypeScript configuration
npm run typecheck

# Fix type errors
npm run typecheck -- --fix

# Check specific file
npx tsc --noEmit src/components/Component.tsx
```

## Build & Deployment Issues

### Build Failures

#### Memory Issues During Build

**Problem**: Build fails due to insufficient memory

**Symptoms**:

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**Solution**:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or in package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

#### Dependency Conflicts

**Problem**: Conflicting package versions

**Symptoms**:

```
npm ERR! ERESOLVE overriding peer dependency
```

**Solution**:

```bash
# Check dependency tree
npm ls

# Resolve conflicts
npm install --legacy-peer-deps

# Or use yarn
yarn install
```

#### Environment Variable Issues in Build

**Problem**: Build fails due to missing environment variables

**Symptoms**:

```
Error: Missing required environment variable
```

**Solution**:

```bash
# Check build-time environment variables
npm run env:check:prod

# Set required variables
export NEXT_PUBLIC_SUPABASE_URL="https://..."
export NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Build with environment
npm run build
```

### Deployment Issues

#### Vercel Deployment Failures

**Problem**: Deployment fails on Vercel

**Symptoms**:

```
Build failed: Command "npm run build" exited with code 1
```

**Solution**:

```bash
# Check build logs
vercel logs

# Test build locally
npm run build

# Check environment variables in Vercel
vercel env ls

# Redeploy
vercel --prod
```

#### Database Migration Issues

**Problem**: Database migrations fail during deployment

**Symptoms**:

```
Error: migration failed: relation already exists
```

**Solution**:

```bash
# Check migration status
npm run db:migrations:status

# Reset database (development only)
npm run db:reset

# Run migrations manually
npm run db:migrations:up
```

## Runtime Errors

### Application Errors

#### Hydration Errors

**Problem**: Server/client mismatch causing hydration errors

**Symptoms**:

```
Warning: Text content did not match. Server: "Hello" Client: "Hello World"
```

**Solution**:

```typescript
// Use useEffect for client-only code
import { useEffect, useState } from 'react';

function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return <div>Client content</div>;
}
```

#### API Route Errors

**Problem**: API routes returning errors

**Symptoms**:

```
500 Internal Server Error
```

**Solution**:

```bash
# Check API logs
npm run logs:api

# Test API endpoint
curl -v http://localhost:3000/api/health

# Check API route implementation
// Ensure proper error handling
export async function GET(request: Request) {
  try {
    // API logic
    return Response.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### Authentication Errors

**Problem**: Authentication not working

**Symptoms**:

```
Error: Invalid JWT token
```

**Solution**:

```bash
# Check authentication configuration
npm run auth:verify

# Check Supabase connection
npm run supabase:status

# Verify environment variables
npm run env:check:local
```

### Performance Issues

#### Slow Page Loads

**Problem**: Pages loading slowly

**Symptoms**: Long loading times, poor user experience

**Solution**:

```bash
# Check bundle size
npm run bundle:analyze

# Run performance audit
npm run lhci

# Check Core Web Vitals
npm run perf:web-vitals

# Optimize images
npm run images:optimize
```

#### Memory Leaks

**Problem**: Application memory usage increasing over time

**Symptoms**: High memory usage, application crashes

**Solution**:

```bash
# Monitor memory usage
npm run perf:memory

# Check for memory leaks
npm run perf:leak-check

# Profile application
npm run perf:profile
```

## Database Issues

### Connection Problems

#### Database Connection Failed

**Problem**: Can't connect to Supabase database

**Symptoms**:

```
Error: connect ECONNREFUSED
```

**Solution**:

```bash
# Check Supabase status
npm run supabase:status

# Test database connection
npm run db:test

# Check environment variables
npm run env:check:local

# Verify network connectivity
curl https://your-project.supabase.co/rest/v1/
```

#### Connection Pool Exhausted

**Problem**: Too many database connections

**Symptoms**:

```
Error: connection pool exhausted
```

**Solution**:

```bash
# Check connection pool status
npm run db:connections

# Monitor active connections
npm run db:monitor

# Optimize connection usage
// Use connection pooling in your code
```

### Query Issues

#### Slow Queries

**Problem**: Database queries taking too long

**Symptoms**: Slow page loads, timeout errors

**Solution**:

```bash
# Check slow queries
npm run db:slow-queries

# Analyze query performance
npm run db:analyze-queries

# Optimize queries
// Add proper indexes
// Use query optimization techniques
```

#### Query Errors

**Problem**: Database queries failing

**Symptoms**:

```
Error: relation "table_name" does not exist
```

**Solution**:

```bash
# Check database schema
npm run db:schema

# Verify table exists
npm run db:tables

# Run migrations
npm run db:migrations:up
```

## External Service Issues

### Stripe Integration

#### Payment Processing Errors

**Problem**: Stripe payments failing

**Symptoms**:

```
Error: No such payment_intent: pi_xxx
```

**Solution**:

```bash
# Check Stripe configuration
npm run stripe:verify

# Test Stripe connection
npm run stripe:test

# Check webhook configuration
npm run stripe:webhooks
```

#### Webhook Issues

**Problem**: Stripe webhooks not working

**Symptoms**: Payments not updating in database

**Solution**:

```bash
# Check webhook logs
npm run logs:webhooks

# Verify webhook endpoint
npm run stripe:webhook-endpoint

# Test webhook locally
npm run stripe:webhook-test
```

### Email Service Issues

#### Email Delivery Problems

**Problem**: Emails not being sent

**Symptoms**: Users not receiving emails

**Solution**:

```bash
# Check email service status
npm run email:status

# Test email sending
npm run email:test

# Check email logs
npm run logs:email
```

### Sentry Integration

#### Error Tracking Issues

**Problem**: Errors not appearing in Sentry

**Symptoms**: No error reports in Sentry dashboard

**Solution**:

```bash
# Check Sentry configuration
npm run sentry:verify

# Test error reporting
npm run sentry:test

# Check Sentry DSN
npm run env:check:sentry
```

## Common Error Messages

### Next.js Errors

#### "cookies() must be awaited"

**Problem**: Using cookies() without await

**Solution**:

```typescript
// Incorrect
const cookies = cookies();

// Correct
const cookies = await cookies();
```

#### "use client" directive missing

**Problem**: Client component without "use client" directive

**Solution**:

```typescript
"use client";

import { useState } from "react";

export default function ClientComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Supabase Errors

#### "JWT expired"

**Problem**: Authentication token expired

**Solution**:

```typescript
// Refresh token automatically
const {
  data: { session },
  error,
} = await supabase.auth.getSession();

if (error) {
  await supabase.auth.refreshSession();
}
```

#### "Row Level Security policy violation"

**Problem**: RLS policy blocking access

**Solution**:

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Verify user permissions
SELECT auth.uid() as current_user;
```

### TypeScript Errors

#### "Property does not exist on type"

**Problem**: Type definition missing property

**Solution**:

```typescript
// Add type definition
interface User {
  id: string;
  email: string;
  name?: string; // Optional property
}

// Or use type assertion
const user = data as User;
```

## Debugging Tools

### Development Tools

#### React Developer Tools

```bash
# Install React Developer Tools
npm install -g react-devtools

# Start React Developer Tools
react-devtools
```

#### Next.js Debug Mode

```bash
# Enable Next.js debug mode
DEBUG=* npm run dev

# Enable specific debug
DEBUG=next:* npm run dev
```

#### Database Debugging

```bash
# Enable Supabase debug mode
SUPABASE_DEBUG=1 npm run dev

# Check database logs
npm run db:logs
```

### Production Debugging

#### Error Monitoring

```bash
# Check Sentry for errors
npm run sentry:errors

# Check application logs
npm run logs:app

# Check performance metrics
npm run perf:metrics
```

#### Performance Profiling

```bash
# Run performance audit
npm run perf:audit

# Check Core Web Vitals
npm run perf:web-vitals

# Analyze bundle size
npm run bundle:analyze
```

## Getting Help

### Internal Resources

- **Documentation**: Check the `/docs` directory
- **Code Examples**: Look at existing implementations
- **Test Files**: Review test cases for usage examples

### External Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Stripe Documentation**: https://stripe.com/docs
- **TypeScript Documentation**: https://www.typescriptlang.org/docs

### Support Channels

- **GitHub Issues**: Create an issue in the repository
- **Team Chat**: Use team communication channels
- **Documentation**: Update this troubleshooting guide

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [Runbooks](./RUNBOOKS.md) - Operational procedures
- [Performance](./PERFORMANCE.md) - Performance optimization
- [Security & Privacy](./SECURITY_PRIVACY.md) - Security troubleshooting
- [Testing Strategy](./testing/STRATEGY.md) - Testing and debugging
