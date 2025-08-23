# Troubleshooting Guide

Common issues and solutions for the Permit School application.

## Environment Setup Issues

### Error: "Cannot find module" or "Module not found"

**Problem**: Missing dependencies or incorrect installation.

**Solution**:
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm ci

# For web directory
cd web
rm -rf node_modules package-lock.json  
npm ci
```

### Error: "Environment variable not defined"

**Problem**: Missing required environment variables.

**Solution**:
```bash
# Check environment validation
npm run env:check:local

# Copy example files and fill values
cp env-examples/root.env.local.example .env.local
cp env-examples/web.env.local.example web/.env.local
```

**Required variables** (see [Environment Setup](ENVIRONMENT_SETUP.md)):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Next.js 15 Issues

### Error: "cookies() used in Server Component"

**Problem**: Next.js 15 requires awaiting the `cookies()` function.

**Solution**:
```typescript
// ❌ Wrong (Next.js 14 style)
const cookieStore = cookies();

// ✅ Correct (Next.js 15 style)  
const cookieStore = await cookies();
```

### Hydration Mismatch Errors

**Problem**: Server and client rendering different content.

**Solution**:
1. Use `useEffect` for client-only code
2. Guard browser APIs with `typeof window !== 'undefined'`
3. Use `dynamic` imports with `ssr: false` for client-only components

```typescript
// Client-only component
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
});
```

## Database Issues

### Error: "Connection to Supabase failed"

**Problem**: Supabase not running or incorrect configuration.

**Solution**:
```bash
# Start Supabase locally
supabase start

# Check status
supabase status

# Reset if needed
supabase db reset
```

### Error: "Row Level Security policy violation"

**Problem**: RLS policies blocking database access.

**Solution**:
1. Check user authentication status
2. Verify RLS policies in Supabase dashboard
3. Ensure service role key is used for admin operations

## Build Issues

### Error: "Build failed with TypeScript errors"

**Problem**: Type checking failures.

**Solution**:
```bash
# Check types locally
npm --prefix web run typecheck

# Common fixes
# 1. Update type definitions
# 2. Add proper type annotations
# 3. Fix import/export statements
```

### Error: "ESLint errors in build"

**Problem**: Linting failures preventing build.

**Solution**:
```bash
# Run linting
npm --prefix web run lint

# Fix auto-fixable issues
npm --prefix web run lint -- --fix

# Check accessibility rules
npm --prefix web run lint:a11y
```

## Test Issues

### E2E Test Failures

**Problem**: Playwright tests failing intermittently.

**Solution**:
```bash
# Run tests with debug mode
npm --prefix web run test:e2e:debug

# Run tests with UI mode
npm --prefix web run test:e2e:ui

# Install browsers if missing
npm --prefix web run test:e2e:install
```

**Common fixes**:
1. Increase timeout values
2. Add proper wait conditions
3. Use stable selectors (data-testid)
4. Check test isolation

### Unit Test Failures

**Problem**: Vitest tests failing.

**Solution**:
```bash
# Run tests in watch mode
npm --prefix web run test:watch

# Run specific test file
npm --prefix web run test -- specific-test.test.ts

# Check coverage
npm --prefix web run test -- --coverage
```

## Development Server Issues

### Error: "Port 3000 already in use"

**Problem**: Another process using the port.

**Solution**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm --prefix web run dev -- --port 3001
```

### Error: "Hot reload not working"

**Problem**: File watching issues.

**Solution**:
1. Check file system limits (Linux)
2. Restart development server
3. Clear Next.js cache: `rm -rf web/.next`

## Authentication Issues

### Error: "Session not found" or "User not authenticated"

**Problem**: Authentication state issues.

**Solution**:
1. Clear browser storage and cookies
2. Check Supabase Auth configuration
3. Verify JWT settings and expiration

### Error: "Invalid JWT token"

**Problem**: Token validation failing.

**Solution**:
1. Check system clock synchronization
2. Verify Supabase project settings
3. Clear authentication state and re-login

## Performance Issues

### Slow Page Loads

**Problem**: Performance bottlenecks.

**Solution**:
1. Run Lighthouse audit: `npm --prefix web run lhci`
2. Check Network tab in DevTools
3. Optimize images and assets
4. Review database queries and RLS policies

### Memory Issues

**Problem**: High memory usage or leaks.

**Solution**:
1. Monitor with Chrome DevTools Performance tab
2. Check for unclosed database connections
3. Review component re-renders with React DevTools

## Database Migration Issues

### Error: "Migration failed"

**Problem**: SQL migration errors.

**Solution**:
```bash
# Check migration syntax
python -m pip install sqlfluff
sqlfluff lint --dialect postgres supabase/migrations/*.sql

# Reset and reapply
supabase db reset
supabase db push
```

### Error: "RLS policy conflicts"

**Problem**: Row Level Security policy errors.

**Solution**:
1. Review policy logic in migration files
2. Test policies with different user roles
3. Check for policy conflicts or gaps

## Getting Help

### Debug Information to Collect

When reporting issues, include:

1. **Environment**: OS, Node.js version, npm version
2. **Error logs**: Complete error messages and stack traces
3. **Steps to reproduce**: Exact sequence that causes the issue
4. **Configuration**: Relevant env vars (redacted), package.json info

### Useful Commands for Debugging

```bash
# System information
node --version
npm --version
npm list --depth=0

# Application health
curl http://localhost:3000/api/health

# Database status
supabase status

# Environment validation
npm run env:check:local
npm --prefix web run env:check
```

### Log Files

- **Next.js**: Console output and `.next/trace`
- **Supabase**: Local logs in `supabase/logs/`
- **Playwright**: Test results in `web/test-results/`
- **CI**: GitHub Actions logs in repository Actions tab

### Support Channels

1. **Documentation**: Check relevant docs in `/docs` directory
2. **Issues**: Search GitHub issues for similar problems
3. **Discussions**: Use GitHub Discussions for questions
4. **Code Review**: Request review for complex issues
