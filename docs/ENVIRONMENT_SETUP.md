---
title: "Environment Setup"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/LOCAL_DEVELOPMENT.md>
  - </docs/TESTING.md>
---

# Environment Setup

**Purpose & Outcome**  
Complete development environment setup for Permit School. After following this guide, you'll have a fully functional local development environment with all services running and ready for development.

## Prerequisites

### Required Software

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Supabase CLI** - [Install](https://supabase.com/docs/guides/cli)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

### Optional Software

- **VS Code** - Recommended editor with extensions
- **Postman** - API testing (optional)
- **TablePlus** - Database GUI (optional)

### Accounts & API Keys

- **Supabase** - [Sign up](https://supabase.com/) for free tier
- **Stripe** - [Sign up](https://stripe.com/) for test account
- **Resend** - [Sign up](https://resend.com/) for email service
- **GitHub** - For repository access

## Steps

### 1. Clone Repository

```bash
git clone https://github.com/rms730/permit-school.git
cd permit-school
```

### 2. Install Dependencies

```bash
# Install web app dependencies
npm --prefix web ci

# Install Supabase CLI (if not already installed)
npm install -g supabase
```

### 3. Set Up Supabase Project

```bash
# Login to Supabase
supabase login

# Create new project (or use existing)
supabase projects create permit-school-dev

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Configure Environment Variables

```bash
# Copy environment templates (creates both root and web env files)
npm run env:copy

# Edit with your values
nano .env.local          # Root-level variables for scripts/tools
nano web/.env.local      # Web app variables
```

**Environment Structure**:

We use a multi-environment setup with separate files for different contexts:

- **Root level** (`.env.local`, `.env.dev`, `.env.prod`) - For scripts, tools, and CI (this step)
- **Web level** (`web/.env.local`, `web/.env.development`, `web/.env.production`) - For Next.js app (handled separately)

**Required environment variables**:

**Root-level variables** (`.env.local`):
```bash
# Supabase (get from your project dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_PUBLISHABLE_KEY=${SUPABASE_ANON_KEY}

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-key

# Base URL
BASE_URL=http://localhost:3000

# Test Configuration
TESTKIT_ON=true
TESTKIT_TOKEN=your-testkit-token
```

**Web-level variables** (`web/.env.local`):
```bash
# Client-exposed (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (never exposed to browser)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional functions URL
SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
```

**Verify your setup**:
```bash
npm run env:check:local
```

### Environment Management Tools

**Available commands**:
```bash
# Copy environment files from examples
npm run env:copy                    # Creates both root and web .env.local files
npm run env:copy:root              # Creates only root .env.local
npm run env:copy:web               # Creates only web .env.local

# Verify environment variables
npm run env:check:local            # Check local environment
npm run env:check:dev              # Check development environment  
npm run env:check:prod             # Check production environment
```

**Environment files structure**:
```
permit-school/
├── .env.example                   # Root base template
├── .env.local.example            # Root local development
├── .env.dev.example              # Root cloud development
├── .env.prod.example             # Root production
├── web/
│   ├── .env.example              # Web base template
│   ├── .env.local.example        # Web local development
│   ├── .env.development.example  # Web cloud development
│   └── .env.production.example   # Web production
└── tools/
    └── check-env.mjs             # Environment verification utility
```

**Security notes**:
- Never commit real `.env` files (only `.example` files are tracked)
- Server-only secrets (like `SUPABASE_SERVICE_ROLE_KEY`) are never exposed to the browser
- Client-safe variables use `NEXT_PUBLIC_` prefix
- Use GitHub Secrets for CI/CD environment variables

### 5. Start Local Development

```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start web app
npm --prefix web run dev

# Terminal 3: Apply migrations
supabase db push
```

### 6. Seed Initial Data

```bash
# Seed handbook content
npm --prefix web run seed:handbooks

# Create admin user
node web/scripts/make_admin.mjs your-email@example.com
```

## Verify

### Check Services

```bash
# Web app health
curl http://localhost:3000/api/health
# Expected: {"status":"healthy","environment":"development"}

# Supabase status
supabase status
# Should show all services running

# Database connection
supabase db reset
# Should complete without errors
```

### Test Core Functionality

1. **Visit the app**: http://localhost:3000
2. **Sign up**: Create a test account
3. **Admin access**: Login with your admin email
4. **Course access**: Visit http://localhost:3000/courses
5. **Tutor test**: Try asking a question on the home page

### Expected URLs

| Service                | URL                              | Purpose           |
| ---------------------- | -------------------------------- | ----------------- |
| **Web App**            | http://localhost:3000            | Main application  |
| **Supabase Dashboard** | http://localhost:54323           | Local database UI |
| **Admin Interface**    | http://localhost:3000/admin      | Admin dashboard   |
| **API Health**         | http://localhost:3000/api/health | System status     |
| **Course Catalog**     | http://localhost:3000/courses    | Public courses    |

## Troubleshoot

### Common Issues

**Port already in use**:

```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Supabase won't start**:

```bash
# Check Docker is running
docker ps
# Reset Supabase
supabase stop
supabase start
```

**Database connection errors**:

```bash
# Reset database
supabase db reset
# Re-apply migrations
supabase db push
```

**Environment variables not loading**:

```bash
# Verify file location
ls -la web/.env.local
# Check variable names (no spaces around =)
cat web/.env.local
```

### Reset Everything

```bash
# Stop all services
supabase stop
npm --prefix web run build

# Reset database
supabase db reset

# Restart
supabase start
npm --prefix web run dev
```

## Rollback

If something goes wrong:

```bash
# Stop all services
supabase stop
pkill -f "next dev"

# Reset to clean state
supabase db reset
rm -rf web/.next
npm --prefix web ci

# Restart
supabase start
npm --prefix web run dev
```

## References

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Stripe Test Mode](https://stripe.com/docs/testing)
- [Resend API Documentation](https://resend.com/docs/api-reference)

---

**Next**: [Local Development](LOCAL_DEVELOPMENT.md) - Running the app and development workflow
