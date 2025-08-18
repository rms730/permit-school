# Migration Structure Summary

## Overview

The migration files have been completely rewritten and reorganized into a clean, logical sequence. The original 27 scattered migrations have been consolidated into 19 well-organized migrations.

## Migration Sequence

### 0000_initial_schema.sql

**Core Schema Setup**

- All core tables, indexes, and initial data
- Extensions (uuid-ossp, pgcrypto, vector)
- Enums (attempt_mode, cert_status, export_status, deletion_status)
- Core tables: jurisdictions, courses, course_units, profiles, guardian_links, unit_progress, attempts, attempt_items, skill_mastery, question_bank, content_chunks, certificates, certificate_serials
- Billing tables: billing_customers, subscriptions, entitlements, billing_events
- Security tables: tutor_logs, seat_time_events, consents, notifications, regulatory_artifacts, data_exports, deletion_requests, audit_logs
- All RLS policies and indexes
- Initial data (CA, TX jurisdictions, default CA course)

### 0001_rag_functions.sql

**RAG Helper Functions**

- match_content_chunks() - Vector similarity search
- match_content_chunks_hybrid() - Combined vector + full-text search

### 0002_curriculum_admin.sql

**Curriculum & Admin Features**

- unit_chunks table for content mapping
- Course unit seeding (Traffic Basics, Signs and Signals, Safe Driving Practices)
- RLS policies for curriculum tables

### 0003_jurisdiction_config.sql

**Jurisdiction Configuration**

- jurisdiction_configs table
- billing_prices table
- certificate_no_seq sequence
- make_certificate_number() function
- v_course_catalog view
- RLS policies

### 0004_profiles_enrollment.sql

**Student Profiles & Enrollment**

- student_profiles table with PII fields
- enrollments table
- touch_updated_at() trigger function
- RLS policies for profiles and enrollments

### 0005_guardian_features.sql

**Guardian Portal Features**

- guardian_requests table
- guardian_status enum
- v_guardian_latest view
- RLS policies for guardian features

### 0006_i18n.sql

**Internationalization**

- locale column in student_profiles
- question_translations table
- v_question_text view
- RLS policies for translations

### 0007_question_bank_admin.sql

**Question Bank Administration**

- Extended question_bank with status, tags, versioning
- exam_blueprints and exam_blueprint_rules tables
- RLS policies for question administration

### 0008_security_privacy.sql

**Security & Privacy Features**

- Performance indexes for security tables
- generate_audit_signature() function
- log_audit() function
- RLS policies for security tables

### 0009_guardian_portal.sql

**Guardian Portal & Notifications**

- notification_type enum
- Extended notifications table
- v_guardian_children and v_guardian_student_course views
- RLS policies for notifications

### 0010_regulatory_reporting.sql

**Regulatory Reporting**

- regulatory_runs and regulatory_artifacts tables
- DMV reports storage bucket
- Performance indexes for time-range queries
- RLS policies for regulatory features

### 0011_billing_lifecycle.sql

**Billing Lifecycle Management**

- billing_dunning_state enum
- billing_invoices and billing_dunning tables
- v_billing_summary_my view
- RLS policies for billing

### 0012_auth_ui_foundation.sql

**Auth UI Foundation**

- Extended profiles with avatar_url, preferred_name, last_login_at, ui_variant
- Indexes for UI variant and last login queries
- Documentation comments

### 0013_modern_shell_settings.sql

**Modern Shell Settings**

- Extended profiles with theme_pref, marketing_opt_in
- Avatars storage bucket and RLS policies
- Documentation comments

### 0014_cert_fulfillment.sql

**Certificate Fulfillment**

- cert_fulfillment_status enum
- cert_stock, fulfillment_batches, fulfillment_items tables
- RLS policies for fulfillment features

### 0015_handbook_sources.sql

**Handbook Sources**

- handbooks storage bucket
- handbook_sources table
- RLS policies for handbook management

### 0016_jurisdiction_config_extensions.sql

**Jurisdiction Config Extensions**

- Extended jurisdiction_configs with certificate issuer info
- v_jurisdiction_config view
- CA configuration updates

### 0017_i18n.sql

**i18n Updates**

- Re-creation of question_translations table
- Updated RLS policies
- v_question_text view

### 0018_learner_ux_polish.sql

**Learner UX Polish**

- Extended profiles with engagement tracking fields
- Indexes for engagement queries
- Documentation comments

## Key Improvements

1. **Logical Organization**: Migrations are now organized by feature area rather than chronological development
2. **No Duplicates**: Eliminated duplicate table creations and conflicting migrations
3. **Clean Dependencies**: Each migration builds logically on the previous ones
4. **Consistent Naming**: All migrations follow a clear naming convention
5. **No Cleanup Files**: Removed unnecessary cleanup migrations since this is a fresh start
6. **Defensive FK Creation**: Removed defensive foreign key creation since auth.users will exist
7. **Consolidated Features**: Related features are grouped together in single migrations

## Migration Flow

The migration sequence follows this logical progression:

1. Core schema and data
2. RAG functionality
3. Curriculum and admin features
4. Jurisdiction configuration
5. User profiles and enrollment
6. Guardian features
7. Internationalization
8. Question bank administration
9. Security and privacy
10. Guardian portal and notifications
11. Regulatory reporting
12. Billing lifecycle
13. Auth UI foundation
14. Modern shell settings
15. Certificate fulfillment
16. Handbook sources
17. Jurisdiction config extensions
18. i18n updates
19. Learner UX polish

This structure provides a clean, maintainable migration history that can be easily understood and extended.
