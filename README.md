# permit-school

Agentic, multi‑state permit‑prep platform — **California first**, **Texas next**.

**Stack**: Supabase (Postgres + RLS + pgvector), Next.js + MUI, OpenAI (GPT‑5 family for planning/review/tutor), n8n (orchestration), Cursor (agent coder).

> This repo starts minimal so the agentic loop can iterate.  
> Secrets (OpenAI, Supabase service role) belong in n8n/Edge Functions, **not** in the repo.

## Structure (initial)

/supabase/migrations/ – schema & RLS
/web/ – Next.js + MUI Tutor MVP
/.cursor/ – rules for Cursor agents
/ops/prompts/ – system prompts (planner/reviewer/tutor/etc.)
/ops/config/budgets.json – token/image budgets + kill switch
/.github/workflows/ci.yml – basic CI checks (lint/test/build)
/.github/workflows/web.yml – web app CI (lint/typecheck/build)
/states/ca/ – CA-specific docs/assets (seed)
/states/tx/ – TX placeholder
PLAN.md – initial backlog (agent-readable)

## Multi‑state concept

- `jurisdictions` stores per‑state metadata (e.g., certificate type).
- `courses` link to a jurisdiction with requirements (e.g., CA 30×50‑minute periods).
- Content, questions, and certificates reference a `jurisdiction_id`.

## Certificates

Issuing California **DL‑400C** requires a DMV‑licensed school with physical stock. This app queues issuance; the licensed operator fulfills.

## Getting started

1. Apply the migration in **Supabase** (SQL editor).
2. In n8n, add credentials for OpenAI, GitHub, and Supabase; import the planner/coder/reviewer/visuals workflows (next PR).
3. Enable repo rules so CI checks (`lint`, `test`, `build`) are required before merge.

## Web App (Tutor MVP)

**Prerequisites**: Node 20+, Supabase project with `tutor` function deployed.

### Setup

```bash
cp web/.env.example web/.env.local
# fill values (do NOT commit real secrets)
```

### Run

```bash
npm --prefix web i
npm --prefix web run dev
# open http://localhost:3000
```

### Smoke test

```bash
curl -s -X POST http://localhost:3000/api/tutor \
  -H 'Content-Type: application/json' \
  -d '{"query":"When can I turn right on red in California?","j_code":"CA"}' | jq
```

> **Security**: The service role key lives only in `web/.env.local` and never on the client.

### Sprint 2: Logs & State Picker

- Apply migration `0004_tutor_logs.sql` in Supabase (SQL Editor or CLI).
- In `web/.env.local`, set:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - (optional) SUPABASE_FUNCTIONS_URL
- Run web:
  - `npm --prefix web i && npm --prefix web run dev`
- Try a query on `/` and then view logs at `/admin/logs`.

### Sprint 3: Auth & RBAC

1. In Supabase → Auth:
   - (Dev) Disable email confirmation for quick testing, or configure SMTP.
2. Copy env:
   - `cp web/.env.example web/.env.local`
   - Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Run locally:
   - `npm --prefix web i && npm --prefix web run dev`
4. Create a user at `/signin`, then promote to admin:
   - `node web/scripts/make_admin.mjs you@example.com`
5. Visit `/admin/logs` (must be signed in as admin).
6. Ask a question on `/`; check `tutor_logs.user_id` is populated.

### Sprint 4: Curriculum & Learning Experience

1. Apply the curriculum migration:

   ```bash
   # If using Supabase CLI
   supabase db push

   # Or run the migration manually in your Supabase dashboard
   # Copy contents of supabase/migrations/0005_curriculum.sql
   ```

2. Verify the migration:
   - Check that 5 units are created for CA DE-ONLINE course
   - Verify `unit_chunks` are populated with relevant content

3. Test the learning flow:
   - Visit `/course/CA/DE-ONLINE` to see the course outline
   - Click "Start" on a unit to begin learning at `/learn/[unitId]`
   - Study the content (seat-time tracking active when tab visible)
   - Take the quiz when enough time is accrued
   - Complete the quiz and see your score

4. Key features:
   - **Seat-time tracking**: Only counts when tab is visible and user is active
   - **Progress persistence**: Time is saved and capped at required minutes
   - **Quiz gating**: Must complete required study time before taking quiz
   - **Score tracking**: Quiz results update skill mastery
   - **RLS security**: All data access respects user permissions

### Sprint 5: Payments & Entitlements (Stripe)

1. **Stripe Setup**:
   - Create a Stripe account and get your API keys
   - Create a product and price in Stripe Dashboard (recurring monthly subscription)
   - Note the `price_id` for your subscription

2. **Environment Variables**:
   Add these to `web/.env.local`:
   ```bash
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PRICE_ID=price_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   
   # Billing URLs
   BILLING_SUCCESS_URL=http://localhost:3000/billing?status=success
   BILLING_CANCEL_URL=http://localhost:3000/billing?status=cancel
   ```

3. **Database Migration**:
   ```bash
   # Apply the billing migration
   supabase db push
   # Or manually run supabase/migrations/0006_billing.sql
   ```

4. **Webhook Setup**:
   ```bash
   # Install Stripe CLI and forward webhooks locally
   stripe listen --forward-to http://localhost:3000/api/billing/webhook
   ```

5. **Test the Flow**:
   - Visit `/billing` to see subscription options
   - Click "Subscribe Now" to go through Stripe Checkout
   - Use test card `4242 4242 4242 4242` with any future expiry
   - Verify entitlement is activated and Unit 2+ unlocks
   - Test webhook by canceling subscription in Stripe Dashboard

6. **Key Features**:
   - **Entitlement gating**: Unit 1 free, Units 2+ require subscription
   - **Stripe integration**: Checkout, Portal, and webhook handling
   - **Subscription management**: Users can manage billing via Stripe Portal
   - **RLS policies**: Secure access to billing data
   - **Event logging**: All billing events stored for admin review


### Sprint 6: Final Exam, Compliance Gating & Draft Certificate

1. **Final Exam Setup**:
   - Apply the exam migration: `supabase db push`
   - Configure exam thresholds in `web/.env.local`:
     ```bash
     FINAL_EXAM_NUM_QUESTIONS=30
     FINAL_EXAM_PASS_PCT=0.8
     FINAL_EXAM_MINUTES_REQUIRED=150
     ```

2. **Eligibility Requirements**:
   - **Entitlement**: Must have active subscription
   - **Seat Time**: Must complete 150 minutes of study time across all units
   - **Course Progress**: All units should be accessible

3. **Exam Flow**:
   - Visit `/exam` to check eligibility
   - If eligible: Start final exam → Answer questions → Submit
   - On pass (≥80%): Draft certificate automatically issued
   - On fail: Can retry after reviewing course material

4. **Admin Features**:
   - `/admin/exams`: View final exam attempts with scores and status
   - `/admin/certificates`: View certificate drafts with CSV export
   - All admin pages enforce existing RLS policies

5. **Key Features**:
   - **Compliance gating**: Entitlement + seat-time requirements
   - **Final exam**: 30 questions across all course material
   - **Draft certificates**: Automatically issued on pass
   - **Admin oversight**: Review attempts and certificate status
   - **Reused infrastructure**: Leverages existing attempts/quiz system

6. **Environment Variables**:
   - `FINAL_EXAM_NUM_QUESTIONS`: Number of exam questions (default: 30)
   - `FINAL_EXAM_PASS_PCT`: Pass threshold as decimal (default: 0.8 = 80%)
   - `FINAL_EXAM_MINUTES_REQUIRED`: Minimum seat time in minutes (default: 150)

7. **Certificate Status**:
   - **Draft**: Automatically issued when exam is passed
   - **Issued**: Finalized with PDF and unique number
   - **Void**: Certificate invalidated

### Sprint 7: Certificate Issuance & Verification

1. **Certificate Setup**:
   - Apply the certificate migration: `supabase db push`
   - Configure certificate settings in `web/.env.local`:
     ```bash
     APP_ORIGIN=http://localhost:3000
     CERT_ISSUER_NAME=Acme Driving Academy
     CERT_ISSUER_LICENSE=CA-INS-000123
     CERT_NUMBER_PREFIX=CA
     ```

2. **Storage Bucket**:
   - The migration creates a `certificates` bucket in Supabase Storage
   - PDFs are stored with public read access
   - Admin-only write access via service role

3. **Certificate Workflow**:
   - **Draft**: Created when student passes final exam
   - **Issue**: Admin clicks "Issue PDF" to finalize certificate
   - **PDF Generation**: Creates tamper-evident PDF with QR code
   - **Verification**: Public verification page at `/verify/[number]`

4. **Admin Features**:
   - `/admin/certificates`: List all certificates with action buttons
   - **Issue PDF**: Convert draft to issued certificate
   - **Void**: Invalidate issued certificates with reason
   - **PDF Download**: Direct link to certificate PDF
   - **Verification Link**: Preview verification page

5. **Public Verification**:
   - `/verify/[number]`: Public verification page
   - Shows certificate validity and details
   - Student name is masked for privacy
   - QR code on PDF links to this page

6. **Key Features**:
   - **Unique numbering**: Format `CA-2025-000123`
   - **PDF generation**: Professional certificates with QR codes
   - **Storage integration**: Supabase Storage for PDFs
   - **Public verification**: Tamper-evident verification system
   - **Admin controls**: Issue/void with audit trail

7. **Environment Variables**:
   - `APP_ORIGIN`: Base URL for verification links
   - `CERT_ISSUER_NAME`: Name of issuing organization
   - `CERT_ISSUER_LICENSE`: License number of issuer
   - `CERT_NUMBER_PREFIX`: Prefix for certificate numbers

8. **Manual Test Flow**:
   ```bash
   # 1) Apply migration
   supabase db push
   
   # 2) Pass final exam to create draft certificate
   # 3) Visit /admin/certificates
   # 4) Click "Issue PDF" on draft certificate
   # 5) Verify PDF is generated and stored
   # 6) Test verification page: /verify/[number]
   # 7) Test void functionality
   ```

<<<<<<< HEAD
### Sprint 8: Launch Hardening & Operational Readiness

1. **Transactional Email Setup**:
   - Sign up for [Resend](https://resend.com) and get API key
   - Configure email settings in `web/.env.local`:
     ```bash
     RESEND_API_KEY=re_xxx
     FROM_EMAIL="Permit School <no-reply@yourdomain.com>"
     SUPPORT_EMAIL=support@yourdomain.com
     APP_BASE_URL=http://localhost:3000
     ```

2. **Email Features**:
   - **Welcome emails**: Sent when users sign up
   - **Subscription active**: Sent when subscription is activated
   - **Certificate issued**: Sent with PDF and verification links
   - **Certificate voided**: Sent with reason for voiding
   - **Graceful fallback**: Endpoints work without email keys

3. **Monitoring & Observability**:
   - **Sentry integration**: Error tracking and performance monitoring
   - **Health checks**: `/api/health` endpoint for system status
   - **Admin monitoring**: `/admin/system` for operational dashboard
   - **Billing events**: Track all payment and subscription events

4. **Legal & Compliance**:
   - **Terms of Service**: `/terms` page with MUI components
   - **Privacy Policy**: `/privacy` page with comprehensive policy
   - **Navigation**: Legal links added to AppBar
   - **Contact information**: Support email integration

5. **Rate Limiting**:
   - **In-memory rate limiting**: Basic protection for API endpoints
   - **Configurable limits**: Set via environment variables
   - **Stripe webhook bypass**: Rate limiting skipped for Stripe signatures
   - **Proper headers**: Rate limit information in response headers

6. **Key Features**:
   - **Production-ready emails**: Professional templates with branding
   - **System monitoring**: Health checks and operational dashboard
   - **Legal compliance**: Terms and privacy policy pages
   - **API protection**: Rate limiting on hot endpoints
   - **Graceful degradation**: Services work without optional keys

7. **Environment Variables**:
   ```bash
   # Email Configuration (Resend)
   RESEND_API_KEY=
   FROM_EMAIL="Permit School <no-reply@yourdomain.com>"
   SUPPORT_EMAIL=support@yourdomain.com
   APP_BASE_URL=http://localhost:3000
   
   # Monitoring (Sentry)
   SENTRY_DSN=
   
   # Rate Limiting
   RATE_LIMIT_ON=true
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=60
   ```

8. **Manual Test Flow**:
   ```bash
   # 1) Set up Resend and Sentry (optional)
   # 2) Configure environment variables
   # 3) Test email sending:
   #    - Subscribe to activate subscription email
   #    - Issue certificate to trigger certificate email
   #    - Void certificate to trigger voided email
   # 4) Test monitoring:
   #    - Visit /api/health
   #    - Visit /admin/system
   # 5) Test legal pages:
   #    - Visit /terms and /privacy
   # 6) Test rate limiting:
   #    - Make rapid requests to /api/tutor
   #    - Verify rate limit headers and 429 responses
   ```

9. **Observability**:
   - **Health checks**: Monitor system status and response times
   - **Error tracking**: Sentry captures errors and performance issues
   - **Billing monitoring**: Track subscription and payment events
   - **Rate limiting**: Monitor API usage and abuse prevention
   - **Email delivery**: Track email sending success/failure rates

10. **Production Considerations**:
    - **Email deliverability**: Use verified domain with Resend
    - **Rate limiting**: Consider Redis for multi-instance deployments
    - **Monitoring**: Set up Sentry alerts for critical errors
    - **Legal review**: Have actual terms and privacy policy reviewed
    - **Support system**: Implement proper support ticket system

### Sprint 9: Curriculum CMS + Syllabus & Evidence Reports

1. **Curriculum Management**:
   - Apply the curriculum admin migration: `supabase db push`
   - Access curriculum management at `/admin/curriculum`
   - View courses with unit counts and manage individual course units

2. **Unit Management Features**:
   - **List Units**: View all units for a course with metadata
   - **Edit Units**: Update title, minutes required, learning objectives, and published status
   - **Reorder Units**: Move units up/down using the reorder function
   - **Content Mapping**: Map handbook content chunks to units using AI suggestions

3. **Content Mapping**:
   - **Current Mappings**: View existing content chunks mapped to each unit
   - **AI Suggestions**: Get content suggestions using hybrid RAG search
   - **Replace/Append**: Choose to replace all mappings or append new ones
   - **Manual Management**: Remove individual mappings as needed

4. **Reports Generation**:
   - Access reports at `/admin/reports`
   - **Syllabus PDF**: Generate course syllabus with unit details and objectives
   - **Evidence CSV**: Export student progress data for compliance reporting

5. **Syllabus PDF Features**:
   - **Course Information**: Title, jurisdiction, total required hours
   - **Unit Details**: Number, title, minutes required, learning objectives
   - **Professional Layout**: Clean formatting with page numbers
   - **Download**: Automatic PDF download with course code in filename

6. **Evidence CSV Features**:
   - **Student Data**: User ID, email, full name, role
   - **Progress Metrics**: Seat time minutes, quiz attempts and averages
   - **Exam Results**: Final exam scores and pass status
   - **Certificate Status**: Certificate numbers and issue dates
   - **Date Filtering**: Optional date range filtering for compliance periods

7. **Admin API Endpoints**:
   - `GET /api/admin/curriculum/courses` - List all courses
   - `GET /api/admin/curriculum/units?course_id=...` - List units for a course
   - `POST /api/admin/curriculum/units/update` - Update unit details
   - `POST /api/admin/curriculum/units/reorder` - Reorder units
   - `GET /api/admin/curriculum/units/[unitId]/mappings` - Get current mappings
   - `POST /api/admin/curriculum/units/[unitId]/suggest` - Get content suggestions
   - `POST /api/admin/curriculum/units/[unitId]/save-mappings` - Save mappings
   - `GET /api/admin/reports/syllabus?course_id=...` - Generate syllabus PDF
   - `GET /api/admin/reports/evidence?course_id=...&from=...&to=...` - Generate evidence CSV

8. **Database Changes**:
   - **Unit Metadata**: Added `objectives`, `is_published`, `updated_at` to `course_units`
   - **Progress View**: New `v_student_course_progress` view for reporting
   - **Reorder Function**: `reorder_course_units()` function for safe unit reordering
   - **Indexes**: Added index on `(course_id, unit_no)` for efficient queries

9. **Key Features**:
   - **MUI-Only UI**: All components use Material-UI with no custom CSS
   - **Admin-Only Access**: All endpoints enforce admin role checks
   - **RLS Compliance**: Views and functions respect existing row-level security
   - **Safe Reordering**: Database function prevents constraint violations
   - **AI-Powered Suggestions**: Hybrid RAG search for content mapping
   - **Compliance Ready**: PDF and CSV exports for regulatory requirements
```

### Sprint 10: Platformize for Multi‑State (CA First)

1. **Database Migration**:
   - Apply the jurisdiction configuration migration: `supabase db push`
   - Creates `jurisdiction_configs` table for runtime configuration
   - Creates `billing_prices` table for course-specific pricing
   - Seeds CA configuration with current values (30 questions, 0.8 pass, 150 minutes, CA prefix)

2. **Configuration Lookup Order**:
   - **Primary**: Database (`jurisdiction_configs` table)
   - **Fallback**: Environment variables (existing `FINAL_EXAM_*` vars)
   - **Certificate numbering**: Uses `make_certificate_number()` function with DB prefix

3. **Admin Configuration**:
   - `/admin/jurisdictions`: View and edit jurisdiction configurations
   - **CA Configuration**: Edit exam questions, pass percentage, seat time, certificate prefix
   - **Validation**: Pass percentage (0,1], seat time > 0, required fields
   - **Fallback**: Environment variables remain as backup

4. **Pricing Management**:
   - `/admin/pricing`: Manage course-specific Stripe pricing
   - **Add Prices**: Enter Stripe price IDs for courses
   - **Toggle Active**: Activate/deactivate price configurations
   - **Fallback**: Environment variable `STRIPE_PRICE_ID` if no DB price

5. **Public Course Catalog**:
   - `/courses`: Public course listing with pricing status
   - **Course Display**: Shows jurisdiction, code, title, availability
   - **Pricing Integration**: "Upgrade" CTA only when `has_price=true`
   - **API**: `/api/public/catalog` returns course data with short cache

6. **Updated Exam System**:
   - **Eligibility**: Uses DB config for seat time requirements
   - **Final Exam**: Uses DB config for question count and pass threshold
   - **Backward Compatibility**: CA flows work exactly as before with default config

7. **Billing Integration**:
   - **Checkout**: Accepts `{ course_id }` or `{ j_code, course_code }`
   - **Price Lookup**: Uses `billing_prices` table with active=true
   - **Fallback**: Environment variable if no DB price configured

8. **Key Features**:
   - **DB-backed configuration**: All state-specific rules in database
   - **Environment fallback**: Maintains backward compatibility
   - **Admin UI**: No-code configuration management
   - **Multi-state ready**: Abstracted for easy state addition
   - **Pricing flexibility**: Course-specific Stripe integration

9. **Environment Variables** (fallback only):
   - `FINAL_EXAM_NUM_QUESTIONS`: Fallback question count (default: 30)
   - `FINAL_EXAM_PASS_PCT`: Fallback pass threshold (default: 0.8)
   - `FINAL_EXAM_MINUTES_REQUIRED`: Fallback seat time (default: 150)
   - `STRIPE_PRICE_ID`: Fallback price ID for checkout

10. **Manual Test Flow**:
    ```bash
    # 1) Apply migration
    supabase db push
    
    # 2) Visit /admin/jurisdictions
    # 3) Edit CA configuration (e.g., change seat time to 120 minutes)
    # 4) Test exam eligibility reflects new seat time requirement
    # 5) Visit /admin/pricing
    # 6) Add a Stripe price ID for CA course
    # 7) Test checkout uses new price; remove price → env fallback
    # 8) Visit /courses to see public catalog
    # 9) Verify CA appears and pricing status is correct
    ```
