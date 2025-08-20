---
title: "Permit School - Multi-State Driver Education Platform"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/README.md>
  - </CONTRIBUTING.md>
---

# Permit School

**Multi-state driver education platform** — California first, Texas next. Complete learning experience from enrollment to certificate issuance with regulatory compliance.

## Quick Start (10 minutes)

```bash
# 1. Clone and setup
git clone https://github.com/rms730/permit-school.git
cd permit-school

# 2. Install dependencies
npm --prefix web ci

# 3. Start development environment
npm --prefix web run dev
# In another terminal: supabase start

# 4. Verify setup
curl http://localhost:3000/api/health
# Should return: {"status":"healthy","environment":"development"}
```

**Next**: Visit [http://localhost:3000](http://localhost:3000) and complete the [setup guide](docs/LOCAL_DEVELOPMENT.md).

## What This Is

**Complete driver education platform** with:

- ✅ **Multi-state ready** (CA/TX with easy expansion)
- ✅ **Regulatory compliance** (seat-time tracking, exam gating, DMV reporting)
- ✅ **Modern tech stack** (Next.js + MUI + Supabase + Stripe)
- ✅ **Production hardened** (RLS, audit logs, accessibility, PWA)
- ✅ **Operational tooling** (admin dashboards, runbooks, monitoring)

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase      │    │   External      │
│   (React + MUI) │◄──►│   (Postgres +   │◄──►│   Services      │
│                 │    │   RLS + Auth)   │    │   (Stripe, etc) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Data Flow**: Enrollment → Learning (seat-time) → Quiz → Final Exam → Certificate → DMV Reporting

## Key Features

### For Students

- **Seamless onboarding** with guardian consent for minors
- **Interactive learning** with progress tracking and seat-time compliance
- **Adaptive quizzes** with immediate feedback and celebrations
- **Final exam** with configurable requirements per jurisdiction
- **Digital certificates** with public verification

### For Administrators

- **Comprehensive dashboards** for monitoring and management
- **Regulatory reporting** with tamper-evident DMV submissions
- **Billing lifecycle** with automated dunning and subscription management
- **Question bank** with analytics and blueprint-based exam generation
- **Audit trails** for compliance and security

### For Operators

- **Multi-state configuration** without code changes
- **Automated workflows** for certificate fulfillment
- **Health monitoring** with detailed system status
- **Incident response** procedures and rollback capabilities

## Technology Stack

| Component      | Technology              | Purpose                                       |
| -------------- | ----------------------- | --------------------------------------------- |
| **Frontend**   | Next.js 14 + MUI 6      | React app with App Router and Material Design |
| **Backend**    | Supabase                | PostgreSQL + RLS + Auth + Edge Functions      |
| **Payments**   | Stripe                  | Subscription management and billing           |
| **Email**      | Resend                  | Transactional emails and notifications        |
| **Testing**    | Playwright + Vitest     | E2E and unit testing                          |
| **Monitoring** | Sentry                  | Error tracking and performance                |
| **Deployment** | Vercel + GitHub Actions | CI/CD and hosting                             |

## Development Commands

```bash
# Core development
npm --prefix web run dev          # Start development server
npm --prefix web run build        # Build for production
npm --prefix web run start        # Start production server

# Testing & quality
npm --prefix web run lint         # ESLint with accessibility rules
npm --prefix web run typecheck    # TypeScript type checking
npm --prefix web test             # Unit tests
npm --prefix web run test:e2e     # End-to-end tests
npm --prefix web run axe:ci       # Accessibility testing

# Database operations
supabase start                    # Start local Supabase
supabase db push                  # Apply migrations
supabase db reset                 # Reset local database

# Operations
npm --prefix web run seed:handbooks  # Seed handbook content
node web/scripts/make_admin.mjs email  # Create admin user
```

## Environment Setup

1. Copy example envs:

   - Root: `cp env-examples/root.env.local.example .env.local` (fill values) - for scripts/tools
   - Web: `cp env-examples/web.env.local.example web/.env.local` (fill values) - for Next.js app

2. Verify:

   - Local: `npm run env:check:local`

3. Run:
   - `cd web && npm run dev`

**Never commit real secrets**. Use `.example` files and GitHub Secrets in CI.

**Required environment variables** (see [complete reference](docs/ENVIRONMENT_VARIABLES.md)):

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (required for billing)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# Email (required for notifications)
RESEND_API_KEY=
```

## Documentation

- **[📚 Complete Documentation](docs/README.md)** - Everything you need to know
- **[🚀 Getting Started](docs/LOCAL_DEVELOPMENT.md)** - Environment setup and first run
- **[🏗️ Architecture](docs/WEB_ARCHITECTURE.md)** - System design and data flows
- **[🔧 Operations](docs/RUNBOOKS.md)** - Admin procedures and runbooks
- **[🔒 Security](docs/SECURITY_COMPLIANCE.md)** - RLS, audit logs, and compliance
- **[🏛️ Multi-State](docs/ADDING_A_NEW_STATE.md)** - Adding new jurisdictions
- **[📖 Contributing](CONTRIBUTING.md)** - Development standards and PR process

## Quick Links

| Purpose         | URL                              | Description        |
| --------------- | -------------------------------- | ------------------ |
| **Development** | http://localhost:3000            | Main application   |
| **Admin**       | http://localhost:3000/admin      | Admin dashboard    |
| **Supabase**    | http://localhost:54323           | Database dashboard |
| **Health**      | http://localhost:3000/api/health | System status      |
| **Courses**     | http://localhost:3000/courses    | Public catalog     |

## Support

1. **📖 Check documentation** - Most answers are in the docs
2. **🔍 Search issues** - Look for similar problems
3. **🐛 Report bugs** - Include environment details
4. **💬 Ask questions** - Use GitHub Discussions

## License

This project is proprietary software. See [LICENSE](LICENSE) for details.

---

**Status**: Production ready for California, expanding to Texas  
**Last updated**: 2025-01-27
