---
title: "Local Development"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/ENVIRONMENT_SETUP.md>
  - </docs/TESTING.md>
  - </docs/WEB_ARCHITECTURE.md>
---

# Local Development

**Purpose & Outcome**  
Complete guide for local development workflow, including common tasks, debugging, and best practices. This covers everything from daily development to troubleshooting issues.

## Prerequisites

- ✅ [Environment Setup](ENVIRONMENT_SETUP.md) completed
- ✅ All services running (Supabase, web app)
- ✅ Environment variables configured
- ✅ Initial data seeded

## Development Workflow

### Daily Development

```bash
# 1. Start services
supabase start
npm --prefix web run dev

# 2. Apply any new migrations
supabase db push

# 3. Run tests before committing
npm --prefix web run lint
npm --prefix web test
npm --prefix web run test:e2e
```

### Code Changes

```bash
# Make changes to code
# Save files (auto-reload in dev mode)

# Check for errors in terminal
# Fix any linting issues

# Test your changes
npm --prefix web test
```

### Database Changes

```bash
# Create new migration
supabase migration new migration_name

# Edit the migration file
# Apply migration
supabase db push

# Reset if needed
supabase db reset
```

## Common Development Tasks

### Creating Admin Users

```bash
# Create admin user
node web/scripts/make_admin.mjs user@example.com

# Verify admin access
# Visit http://localhost:3000/admin
```

### Seeding Test Data

```bash
# Seed handbook content
npm --prefix web run seed:handbooks

# Create test users via testkit (for E2E)
# See [Testing Guide](TESTING.md) for details
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Test tutor endpoint
curl -X POST http://localhost:3000/api/tutor \
  -H 'Content-Type: application/json' \
  -d '{"query":"When can I turn right on red?","j_code":"CA"}'

# Test with authentication
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/api/profile
```

### Database Queries

```bash
# Connect to local database
supabase db reset
supabase db push

# View data in Supabase Dashboard
# http://localhost:54323
```

## Development Tools

### VS Code Extensions

**Recommended extensions**:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Supabase** - Database integration
- **Thunder Client** - API testing

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Browser Extensions

- **React Developer Tools** - Component inspection
- **Redux DevTools** - State management (if using Redux)
- **Supabase** - Database inspection

### API Testing

**Thunder Client** (VS Code extension):

```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/tutor",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "query": "When can I turn right on red?",
    "j_code": "CA"
  }
}
```

## Debugging

### Common Issues

**Hot reload not working**:

```bash
# Check for TypeScript errors
npm --prefix web run typecheck

# Restart dev server
npm --prefix web run dev
```

**Database connection issues**:

```bash
# Check Supabase status
supabase status

# Reset database
supabase db reset
supabase db push
```

**Environment variables not loading**:

```bash
# Verify .env.local exists
ls -la web/.env.local

# Check variable names
cat web/.env.local | grep SUPABASE
```

**Port conflicts**:

```bash
# Find process using port
lsof -i :3000
lsof -i :54321

# Kill process
kill -9 <PID>
```

### Debug Mode

```bash
# Start with debug logging
DEBUG=* npm --prefix web run dev

# Debug specific modules
DEBUG=supabase:* npm --prefix web run dev
```

### Database Debugging

```bash
# View migration history
supabase migration list

# Check RLS policies
supabase db reset
supabase db push

# Test queries in Supabase Dashboard
# http://localhost:54323
```

## Testing

### Running Tests

```bash
# Unit tests
npm --prefix web test

# E2E tests
npm --prefix web run test:e2e

# Accessibility tests
npm --prefix web run axe:ci

# All tests
npm --prefix web run lint && npm --prefix web test && npm --prefix web run test:e2e
```

### Test Data

**Creating test users**:

```bash
# Via testkit (E2E only)
curl -X POST http://localhost:3000/api/testkit/user \
  -H "Authorization: Bearer $TESTKIT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","admin":true}'
```

**Resetting test data**:

```bash
# Reset all test data
curl -X POST http://localhost:3000/api/testkit/reset \
  -H "Authorization: Bearer $TESTKIT_TOKEN"
```

## Performance

### Development Performance

```bash
# Build analysis
npm --prefix web run build

# Bundle analysis
npm --prefix web run build:analyze

# Performance monitoring
npm --prefix web run lighthouse
```

### Database Performance

```bash
# Check slow queries
# Use Supabase Dashboard: http://localhost:54323

# Add indexes for slow queries
supabase migration new add_performance_indexes
```

## Deployment

### Local Production Build

```bash
# Build for production
npm --prefix web run build

# Start production server
npm --prefix web run start

# Test production build
curl http://localhost:3000/api/health
```

### Environment Variables

**Development vs Production**:

```bash
# Development (.env.local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Production (environment variables)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Best Practices

### Code Organization

- **Components**: `web/src/components/`
- **Pages**: `web/src/app/`
- **API Routes**: `web/src/app/api/`
- **Database**: `supabase/migrations/`
- **Tests**: `web/tests/`

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/your-feature
```

### Environment Management

- **Never commit secrets** - Use `.env.local` for local development
- **Use environment variables** - For production configuration
- **Test with real data** - Use testkit for E2E tests
- **Reset frequently** - Keep database clean

## Troubleshoot

### Complete Reset

```bash
# Stop all services
supabase stop
pkill -f "next dev"

# Clean everything
rm -rf web/.next
rm -rf web/node_modules
supabase db reset

# Reinstall and restart
npm --prefix web ci
supabase start
npm --prefix web run dev
```

### Common Error Messages

**"Module not found"**:

```bash
# Reinstall dependencies
npm --prefix web ci
```

**"Database connection failed"**:

```bash
# Restart Supabase
supabase stop
supabase start
```

**"Port already in use"**:

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

## References

- [Next.js Development](https://nextjs.org/docs/development)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [TypeScript Configuration](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**Next**: [Testing Guide](TESTING.md) - Unit, E2E, and accessibility testing
