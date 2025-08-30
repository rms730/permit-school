---
title: "Permit School Documentation"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </README.md>
  - </CONTRIBUTING.md>
---

# Permit School Documentation

**Purpose & Outcome**  
This documentation hub provides everything you need to understand, develop, operate, and contribute to Permit School. Whether you're a new developer setting up your environment, an operator running the platform, or a contributor adding features, you'll find authoritative guidance here.

## Quick Start

```bash
# Clone and setup
git clone https://github.com/rms730/permit-school.git
cd permit-school

# Install dependencies
npm --prefix web ci

# Start development environment
npm --prefix web run dev
# In another terminal: supabase start

# Run tests
npm --prefix web run lint && npm --prefix web test && npm --prefix web run test:e2e
```

## Documentation Table of Contents

### 🚀 Getting Started

- **[Environment Setup](ENVIRONMENT_SETUP.md)** - Complete development environment setup
- **[Local Development](LOCAL_DEVELOPMENT.md)** - Running the app locally with database and services
- **[Testing Guide](TESTING.md)** - Unit, E2E, accessibility, and performance testing

### 🏗️ Architecture

- **[System Architecture](ARCHITECTURE.md)** - High-level system design and data flows
- **[Web Application](WEB_ARCHITECTURE.md)** - Next.js App Router, MUI components, theme system
- **[Backend Services](BACKEND_ARCHITECTURE.md)** - Supabase, RLS policies, Edge Functions
- **[Data Flows](DATA_FLOWS.md)** - Enrollment → Learning → Exam → Certificate → Reporting

### 🔧 Operations

- **[Runbooks](RUNBOOKS.md)** - Step-by-step operational procedures
- **[Incident Response](INCIDENT_RESPONSE.md)** - On-call checklist and emergency procedures
- **[Regulatory Reporting](DMV_REPORTING.md)** - DMV submission and compliance workflows
- **[Billing Operations](BILLING_LIFECYCLE.md)** - Stripe lifecycle and dunning management
- **[Fulfillment](FULFILLMENT_CA.md)** - Certificate issuance and physical fulfillment

### 🔒 Security & Compliance

- **[Security Overview](SECURITY_COMPLIANCE.md)** - RLS, authentication, and data protection
- **[Privacy Operations](PRIVACY_RUNBOOK.md)** - DSAR, deletion, and audit procedures
- **[PII Management](PII_AND_COMPLIANCE.md)** - Data boundaries and retention policies

### 🌐 Localization & Content

- **[Internationalization](I18N_SETUP.md)** - Multi-language support and content strategy
- **[Content Management](CONTENT_MANAGEMENT.md)** - Handbook ingestion and curriculum management
- **[Design System](DESIGN_SYSTEM.md)** - MUI components and theme guidelines

### 🏛️ State Management

- **[Adding New States](ADDING_A_NEW_STATE.md)** - Multi-state expansion guide
- **[California](states/ca/README.md)** - CA-specific configuration and requirements
- **[Texas](states/tx/README.md)** - TX-specific setup and configuration

### 📚 Contributing

- **[Development Guide](CONTRIBUTING.md)** - Code standards, testing, and PR process
- **[Configuration Strategy](CONFIGURATION_STRATEGY.md)** - Environment and feature flags
- **[Migration Guide](MIGRATION_STRUCTURE.md)** - Database schema and migration patterns

### 🔧 Technical Reference

- **[API Reference](api/ROUTES.md)** - Complete API endpoint documentation
- **[Environment Variables](ENVIRONMENT_VARIABLES.md)** - All environment variables and configuration
- **[Testing Strategy](testing/STRATEGY.md)** - Testing approach and best practices
- **[Testing Coverage](testing/COVERAGE.md)** - Current test coverage and metrics
- **[Playwright E2E](testing/PLAYWRIGHT.md)** - End-to-end testing guide
- **[Accessibility](ACCESSIBILITY.md)** - WCAG compliance and testing
- **[Performance](PERFORMANCE.md)** - Performance monitoring and optimization
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

## Documentation Standards

### Front Matter

Every document includes:

```yaml
---
title: "Clear, action-oriented title"
owner: "Team/role responsible"
last_reviewed: "YYYY-MM-DD"
status: "authoritative|draft|deprecated"
related:
  - </docs/related-doc.md>
  - </web/src/component.tsx>
---
```

### Structure

- **Purpose & Outcome** - Why this matters and what success looks like
- **Prerequisites** - Required accounts, tools, and environment variables
- **Steps** - Numbered, copy-pasteable commands
- **Verify** - Expected outputs and success indicators
- **Troubleshoot** - Common errors and solutions
- **Rollback** - How to restore previous state
- **References** - Links to code and external resources

### Quality Checklist

- [ ] Links valid and working
- [ ] Commands tested and verified
- [ ] Last reviewed date updated
- [ ] Cross-references accurate
- [ ] No broken code examples

## Documentation Owners

| Document              | Owner       | Last Review |
| --------------------- | ----------- | ----------- |
| Environment Setup     | Engineering | 2025-01-27  |
| Local Development     | Engineering | 2025-01-27  |
| Testing Guide         | Engineering | 2025-01-27  |
| Web Architecture      | Engineering | 2025-01-27  |
| Backend Architecture  | Engineering | 2025-01-27  |
| Data Flows            | Engineering | 2025-01-27  |
| Runbooks              | Operations  | 2025-01-27  |
| Incident Response     | Operations  | 2025-01-27  |
| Security & Compliance | Security    | 2025-01-27  |
| Privacy Operations    | Legal       | 2025-01-27  |
| I18N Setup            | Engineering | 2025-01-27  |
| Design System         | Design      | 2025-01-27  |
| State Management      | Product     | 2025-01-27  |
| Contributing          | Engineering | 2025-01-27  |

## Quick Reference

### Essential Commands

```bash
# Development
npm --prefix web run dev          # Start development server
npm --prefix web run build        # Build for production
npm --prefix web run start        # Start production server

# Testing
npm --prefix web run lint         # ESLint with accessibility rules
npm --prefix web run typecheck    # TypeScript type checking
npm --prefix web test             # Unit tests
npm --prefix web run test:e2e     # End-to-end tests
npm --prefix web run axe:ci       # Accessibility testing

# Database
supabase start                    # Start local Supabase
supabase db push                  # Apply migrations
supabase db reset                 # Reset local database

# Operations
npm --prefix web run seed:handbooks  # Seed handbook content
node web/scripts/make_admin.mjs email  # Create admin user
```

### Environment Variables

```bash
# Required for development
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Required for production
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
```

### Key URLs

- **Development**: http://localhost:3000
- **Supabase Dashboard**: http://localhost:54323
- **Admin Interface**: http://localhost:3000/admin
- **API Health**: http://localhost:3000/api/health

## Getting Help

1. **Check this documentation** - Most questions are answered here
2. **Review existing issues** - Search GitHub issues for similar problems
3. **Create a new issue** - Include environment details and error messages
4. **Join discussions** - Use GitHub Discussions for questions and ideas

---

**Last updated**: 2025-01-27  
**Next review**: 2025-02-27
