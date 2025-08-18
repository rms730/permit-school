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
# Copy environment template
cp web/.env.example web/.env.local

# Edit with your values
nano web/.env.local
```

**Required environment variables**:

```bash
# Supabase (get from your project dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (get from Stripe dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (get from Resend dashboard)
RESEND_API_KEY=re_...
FROM_EMAIL="Permit School <no-reply@yourdomain.com>"
SUPPORT_EMAIL=support@yourdomain.com

# App configuration
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Monitoring
SENTRY_DSN=
```

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
