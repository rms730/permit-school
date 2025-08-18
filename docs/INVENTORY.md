---
title: "Documentation Inventory"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "draft"
---

# Documentation Inventory

**Purpose & Outcome**  
Complete inventory of all documentation files in the Permit School repository, tracking their current state, purpose, and rewrite status for the comprehensive documentation refresh.

## Inventory Summary

| Status             | Count | Description                        |
| ------------------ | ----- | ---------------------------------- |
| ✅ **Complete**    | 4     | Fully rewritten with new standards |
| 🔄 **In Progress** | 0     | Currently being rewritten          |
| ⏳ **Pending**     | 25    | Needs rewrite                      |
| 🗑️ **Deprecated**  | 0     | Should be removed or consolidated  |

## Top-Level Documentation

| File                     | Purpose                              | Audience                 | Last Updated | Status          | Issues                           |
| ------------------------ | ------------------------------------ | ------------------------ | ------------ | --------------- | -------------------------------- |
| `README.md`              | Project overview and quick start     | Developers, stakeholders | 2025-01-27   | ✅ **Complete** | None                             |
| `CONTRIBUTING.md`        | Development standards and PR process | Contributors             | 2025-01-27   | ✅ **Complete** | None                             |
| `AGENT.md`               | Cursor agent configuration           | AI assistants            | 2025-08-09   | ⏳ **Pending**  | Outdated, needs refresh          |
| `INCIDENT_RESPONSE.md`   | Emergency procedures                 | Operations               | 2025-08-16   | ⏳ **Pending**  | Needs operational runbook format |
| `MIGRATION_SUMMARY.md`   | Database migration history           | Developers               | 2025-08-16   | ⏳ **Pending**  | Needs current migration mapping  |
| `PLAN.md`                | Project roadmap                      | Product, engineering     | 2025-08-16   | ⏳ **Pending**  | Outdated, needs current roadmap  |
| `PR_BODY.md`             | PR template                          | Contributors             | 2025-08-10   | ⏳ **Pending**  | Needs structured template        |
| `PRIVACY_RUNBOOK.md`     | Privacy operations                   | Legal, operations        | 2025-08-16   | ⏳ **Pending**  | Needs DSAR procedures            |
| `SECURITY_COMPLIANCE.md` | Security overview                    | Security, compliance     | 2025-08-16   | ⏳ **Pending**  | Needs RLS and audit coverage     |

## Documentation Hub

| File             | Purpose                    | Audience  | Last Updated | Status          | Issues |
| ---------------- | -------------------------- | --------- | ------------ | --------------- | ------ |
| `docs/README.md` | Documentation landing page | All users | 2025-01-27   | ✅ **Complete** | None   |

## Getting Started Guides

| File                        | Purpose                         | Audience       | Last Updated | Status          | Issues |
| --------------------------- | ------------------------------- | -------------- | ------------ | --------------- | ------ |
| `docs/ENVIRONMENT_SETUP.md` | Complete environment setup      | New developers | 2025-01-27   | ✅ **Complete** | None   |
| `docs/LOCAL_DEVELOPMENT.md` | Development workflow            | Developers     | 2025-01-27   | ✅ **Complete** | None   |
| `docs/TESTING.md`           | Testing strategy and procedures | Developers, QA | 2025-01-27   | ✅ **Complete** | None   |

## Architecture Documentation

| File                           | Purpose                           | Audience               | Last Updated | Status         | Issues         |
| ------------------------------ | --------------------------------- | ---------------------- | ------------ | -------------- | -------------- |
| `docs/WEB_ARCHITECTURE.md`     | Next.js and frontend architecture | Developers             | -            | ⏳ **Pending** | Needs creation |
| `docs/BACKEND_ARCHITECTURE.md` | Supabase and backend architecture | Developers             | -            | ⏳ **Pending** | Needs creation |
| `docs/DATA_FLOWS.md`           | System data flows and integration | Developers, architects | -            | ⏳ **Pending** | Needs creation |

## Operations Documentation

| File                        | Purpose                         | Audience               | Last Updated | Status         | Issues                            |
| --------------------------- | ------------------------------- | ---------------------- | ------------ | -------------- | --------------------------------- |
| `docs/RUNBOOKS.md`          | Operational procedures          | Operations             | 2025-08-16   | ⏳ **Pending** | Needs step-by-step procedures     |
| `docs/BILLING_LIFECYCLE.md` | Stripe and billing operations   | Operations, finance    | 2025-08-16   | ⏳ **Pending** | Needs current Stripe integration  |
| `docs/DMV_REPORTING.md`     | Regulatory reporting procedures | Operations, compliance | 2025-08-16   | ⏳ **Pending** | Needs current reporting workflow  |
| `docs/FULFILLMENT_CA.md`    | Certificate fulfillment         | Operations             | 2025-08-16   | ⏳ **Pending** | Needs current fulfillment process |

## Security & Compliance

| File                         | Purpose                        | Audience             | Last Updated | Status         | Issues                       |
| ---------------------------- | ------------------------------ | -------------------- | ------------ | -------------- | ---------------------------- |
| `docs/PII_AND_COMPLIANCE.md` | Data protection and compliance | Legal, security      | 2025-08-16   | ⏳ **Pending** | Needs current PII boundaries |
| `docs/SECURITY_NOTES.md`     | Security implementation notes  | Security, developers | 2025-08-09   | ⏳ **Pending** | Needs RLS and audit coverage |

## Localization & Content

| File                         | Purpose                     | Audience           | Last Updated | Status         | Issues                            |
| ---------------------------- | --------------------------- | ------------------ | ------------ | -------------- | --------------------------------- |
| `docs/I18N_SETUP.md`         | Internationalization setup  | Developers         | 2025-08-16   | ⏳ **Pending** | Needs current i18n implementation |
| `docs/DESIGN_SYSTEM.md`      | MUI components and design   | Design, developers | 2025-08-16   | ⏳ **Pending** | Needs current MUI usage           |
| `docs/BRANDING_GUIDE.md`     | Brand and design guidelines | Design, marketing  | 2025-08-16   | ⏳ **Pending** | Needs current branding            |
| `docs/LEARNER_EXPERIENCE.md` | Learning experience design  | Product, design    | 2025-08-16   | ⏳ **Pending** | Needs current UX patterns         |

## State Management

| File                         | Purpose                           | Audience               | Last Updated | Status         | Issues                            |
| ---------------------------- | --------------------------------- | ---------------------- | ------------ | -------------- | --------------------------------- |
| `docs/ADDING_A_NEW_STATE.md` | Multi-state expansion guide       | Product, developers    | 2025-08-16   | ⏳ **Pending** | Needs current jurisdiction config |
| `states/ca/README.md`        | California-specific configuration | Operations, developers | 2025-08-09   | ⏳ **Pending** | Needs current CA setup            |
| `states/tx/README.md`        | Texas-specific configuration      | Operations, developers | 2025-08-09   | ⏳ **Pending** | Needs current TX setup            |

## Technical Documentation

| File                             | Purpose                       | Audience               | Last Updated | Status         | Issues                           |
| -------------------------------- | ----------------------------- | ---------------------- | ------------ | -------------- | -------------------------------- |
| `docs/MIGRATION_STRUCTURE.md`    | Database migration patterns   | Developers             | 2025-08-16   | ⏳ **Pending** | Needs current migration strategy |
| `docs/MIGRATIONS_LOCAL.md`       | Local migration procedures    | Developers             | 2025-08-16   | ⏳ **Pending** | Needs current procedures         |
| `docs/CONFIGURATION_STRATEGY.md` | Environment and feature flags | Developers, operations | 2025-08-16   | ⏳ **Pending** | Needs current config strategy    |
| `docs/INGESTION.md`              | Content ingestion procedures  | Operations, developers | 2025-08-09   | ⏳ **Pending** | Needs current ingestion tools    |
| `docs/RAG.md`                    | RAG implementation            | Developers             | 2025-08-09   | ⏳ **Pending** | Needs current RAG setup          |

## Operational Documentation

| File                                 | Purpose                      | Audience               | Last Updated | Status         | Issues                               |
| ------------------------------------ | ---------------------------- | ---------------------- | ------------ | -------------- | ------------------------------------ |
| `docs/OFFLINE_REVIEW.md`             | Offline mode procedures      | Operations, developers | 2025-08-16   | ⏳ **Pending** | Needs current offline implementation |
| `supabase/functions/tutor/README.md` | Tutor function documentation | Developers             | 2025-08-09   | ⏳ **Pending** | Needs current function docs          |
| `web/tests/e2e/README.md`            | E2E testing documentation    | Developers, QA         | 2025-08-16   | ⏳ **Pending** | Needs current testkit docs           |

## Source Documentation

| File                                 | Purpose                   | Audience          | Last Updated | Status         | Issues                    |
| ------------------------------------ | ------------------------- | ----------------- | ------------ | -------------- | ------------------------- |
| `docs/sources/dmv/ATTRIBUTION.md`    | DMV content attribution   | Legal, compliance | 2025-08-11   | ⏳ **Pending** | Needs current attribution |
| `docs/sources/dmv/NOTICE-LICENSE.md` | DMV licensing information | Legal, compliance | 2025-08-16   | ⏳ **Pending** | Needs current licensing   |

## Operational Fixtures

| File                             | Purpose                       | Audience   | Last Updated | Status         | Issues                     |
| -------------------------------- | ----------------------------- | ---------- | ------------ | -------------- | -------------------------- |
| `ops/fixtures/offline/README.md` | Offline fixture documentation | Operations | 2025-08-16   | ⏳ **Pending** | Needs current fixture docs |

## Rewrite Priorities

### High Priority (Critical for Operations)

1. `INCIDENT_RESPONSE.md` - Emergency procedures
2. `docs/RUNBOOKS.md` - Operational procedures
3. `docs/BILLING_LIFECYCLE.md` - Revenue operations
4. `docs/DMV_REPORTING.md` - Compliance requirements
5. `docs/FULFILLMENT_CA.md` - Certificate operations

### Medium Priority (Development & Architecture)

1. `docs/WEB_ARCHITECTURE.md` - Frontend architecture
2. `docs/BACKEND_ARCHITECTURE.md` - Backend architecture
3. `docs/DATA_FLOWS.md` - System integration
4. `docs/MIGRATION_STRUCTURE.md` - Database patterns
5. `docs/ADDING_A_NEW_STATE.md` - Multi-state expansion

### Low Priority (Reference & Support)

1. `docs/DESIGN_SYSTEM.md` - Design guidelines
2. `docs/BRANDING_GUIDE.md` - Brand guidelines
3. `docs/LEARNER_EXPERIENCE.md` - UX documentation
4. `PLAN.md` - Project roadmap
5. `AGENT.md` - AI assistant configuration

## Quality Metrics

### Documentation Standards Compliance

- **Front Matter**: All docs should have proper front matter
- **Structure**: Follow Purpose → Prerequisites → Steps → Verify → Troubleshoot → References
- **Cross-links**: Proper relative linking between documents
- **Code Examples**: Tested and verified code snippets
- **Verification Steps**: Clear success indicators

### Current Compliance Status

- **Front Matter**: 4/29 (14%)
- **Structure**: 4/29 (14%)
- **Cross-links**: 4/29 (14%)
- **Code Examples**: 4/29 (14%)
- **Verification Steps**: 4/29 (14%)

## Next Steps

1. **Complete high-priority rewrites** - Focus on operational documentation
2. **Create missing architecture docs** - Web, backend, and data flow documentation
3. **Update technical references** - Migration, configuration, and state management
4. **Consolidate duplicate content** - Remove or merge redundant documentation
5. **Add verification steps** - Ensure all procedures are testable

## Notes

- All documentation should follow the new template structure
- Cross-references should use relative paths
- Code examples should be tested and verified
- Each document should have a clear owner and review schedule
- Documentation should be actionable and include verification steps

---

**Last updated**: 2025-01-27  
**Next review**: 2025-02-27
