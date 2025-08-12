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

## Sprint 18 — Guardian Portal & In-App Notifications

**Intent**: Give guardians a clear, read-only dashboard of their student's progress and add a privacy-preserving in-app notifications system for both students and guardians.

### Features

#### Guardian Portal
- **My Students** (`/guardian`) - List of linked students with basic info
- **Student Overview** (`/guardian/[studentId]`) - Detailed progress view showing:
  - Student name and age
  - Course progress table with minutes studied, final exam scores, certificate status
  - All data is read-only and respects existing RLS policies

#### Notifications System
- **In-app notifications** with unread badges in the AppBar
- **Notification types**: seat time milestones, quiz completions, final exam results, certificate issuances, guardian consent verification, weekly digests
- **Privacy-preserving**: Only minimal, appropriate data in notifications
- **Fan-out**: Notifications sent to both students and their linked guardians

#### Notification Triggers
- **Seat time milestones**: Every 30 minutes of study time (configurable)
- **Final exam completion**: When student passes final exam
- **Certificate issuance**: When admin issues certificate
- **Guardian consent**: When guardian verifies consent for minor student
- **Weekly digest**: Automated job for guardians (environment-gated)

### Database Schema

The migration `0016_guardian_portal.sql` adds:
- `notifications` table with RLS policies
- `v_guardian_children` view for guardian-student relationships
- `v_guardian_student_course` view for progress summaries

### API Endpoints

#### Guardian Portal
- `GET /api/guardian/children` - List linked students (guardian/admin only)
- `GET /api/guardian/children/[studentId]/courses` - Student course progress

#### Notifications
- `GET /api/notifications` - User's notifications (paginated)
- `POST /api/notifications/read` - Mark notifications as read

#### Jobs
- `POST /api/admin/jobs/weekly-digest` - Generate weekly digest (HMAC protected)

### Privacy & Security

- **RLS on all tables**: Notifications respect user ownership
- **Minimal data**: Notifications contain only necessary context
- **Guardian links**: Access controlled via existing `guardian_links` table
- **No service role on client**: All operations use authenticated user context

### Weekly Digest Job

The weekly digest job aggregates student progress and sends notifications to guardians:

```bash
# Enable the job (set in environment)
WEEKLY_DIGEST_ENABLED=true
ADMIN_JOB_TOKEN=your-secure-token

# Trigger manually (for testing)
curl -X POST http://localhost:3000/api/admin/jobs/weekly-digest \
  -H "Authorization: Bearer your-secure-token"
```

### Multi-state Readiness

- All views include jurisdiction codes (`j_code`, `course_code`)
- No CA-specific logic in code
- Uses `jurisdiction_configs` for state-specific configuration

## Sprint 22 — Google Sign‑In + Teen‑Friendly UX Refresh (Phase 1) + Mobile‑First

**Intent**: Ship a safe, incremental refresh that feels inviting to 15‑year‑olds, keeps CA‑first compliance intact, and lays groundwork for full redesign in later sprints.

### Features

#### Google Sign-In (Supabase OAuth)
- **One-click Google login/signup** with profile upsert and avatar
- **Fully SSR-compatible** OAuth flow
- **Profile upsert on first login** with Google data (display name, avatar, locale)
- **Edge case handling** for existing email accounts
- **Admin MFA requirements preserved**

#### UX Refresh (Phase 1 — Foundations)
- **Modern theme system** with teen-friendly colors (teal/cyan primary, violet secondary)
- **Google Fonts integration** (Rubik for headings, Inter for body)
- **Mobile-first responsive design** with touch-friendly targets (≥44px)
- **New AppBar v2** with user avatar, mobile navigation drawer
- **Hero section** with gradient backgrounds and engaging copy

#### Mobile-First Polish
- **Responsive layouts** that work on xs/sm breakpoints
- **Touch-friendly interactions** with increased hit areas
- **Mobile navigation drawer** with large targets
- **Cards that stack cleanly** on mobile devices

### Database Schema

The migration `0019_auth_ui_foundation.sql` adds:
- `avatar_url` - Google OAuth avatar URL
- `preferred_name` - User preferred display name
- `last_login_at` - Timestamp for analytics
- `ui_variant` - Theme preference ('classic' or 'modern')

### API Endpoints

#### Authentication
- `POST /api/auth/profile/upsert` - Server-side profile upsert (Google OAuth data)
- `/auth/callback` - OAuth callback handler

#### Theme Management
- `POST /api/admin/users/[id]/ui-variant` - Admin toggle for UI variant (HMAC protected)

### Environment Variables

Add to your environment configuration:

```bash
# Google OAuth
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
GOOGLE_OAUTH_ON=true

# Supabase OAuth Configuration
# Configure in Supabase Dashboard → Authentication → Providers → Google
# OAuth redirect: ${NEXT_PUBLIC_APP_BASE_URL}/auth/callback
```

### Google OAuth Setup

1. **Supabase Dashboard**: Go to Authentication → Providers → Google
2. **Enable Google provider** and configure OAuth credentials
3. **Set redirect URL**: `${NEXT_PUBLIC_APP_BASE_URL}/auth/callback`
4. **Environment variables**: Set `GOOGLE_OAUTH_ON=true` to enable

### UI Implementation

#### New Components
- `AppBarV2.tsx` - Modern navigation with mobile drawer
- `modernTheme.ts` - Teen-friendly design tokens
- `/login` & `/signup` pages with Google CTA first
- `/home` page with hero section and benefits

#### Theme System
- **Classic theme**: Existing design (default)
- **Modern theme**: New teen-friendly design
- **Feature flag**: `ui_variant` profile field + cookie override
- **Google Fonts**: Rubik (headings) + Inter (body) loaded via `next/font`

### Mobile-First Design

- **Touch targets**: Minimum 44px for all interactive elements
- **Responsive breakpoints**: xs (0px), sm (600px), md (900px), lg (1200px)
- **Mobile navigation**: Collapsible drawer with large menu items
- **Card layouts**: Stack cleanly on mobile with proper spacing

### Accessibility

- **WCAG 2.2 AA compliance**: Contrast ratios ≥4.5:1
- **Focus management**: Clear focus outlines and keyboard navigation
- **ARIA labels**: Proper labeling for screen readers
- **Color independence**: No information conveyed by color alone

### Forward Plan (Later Sprints)

- **Sprint 23**: Learner surfaces polish (Learn, Quiz, Exam players)
- **Sprint 24**: Modern App Shell, Account & Settings, Avatars, Google One-Tap (opt-in)
- **Sprint 25**: Offline Review Kit + AppShell V2 Roll-Out (CA-first) - [Offline Review Guide](docs/OFFLINE_REVIEW.md)
- **Sprint 26**: Gamification v1 (streaks, badges, progress rewards)

### Usage

#### For Users
1. **Sign up**: Visit `/signup` and click "Continue with Google"
2. **Sign in**: Visit `/login` and use Google OAuth
3. **Profile**: Avatar and name automatically populated from Google

#### For Admins
1. **Toggle UI variant**: Use admin API to switch users between classic/modern themes
2. **Monitor OAuth**: Check Supabase Auth logs for OAuth activity

### Privacy & Security

- **No service role in browser**: All privileged operations server-side
- **RLS maintained**: All existing security policies preserved
- **OAuth data handling**: Only necessary profile data stored
- **Edge case protection**: Existing email accounts not automatically linked
- Ready for expansion to Texas and other states

## Sprint 23 — Learner Surfaces Polish (Modern UI Phase 2) + Quiz/Exam Player v2 + Seat‑Time Integrity

**Intent**: Modernize learning, quiz, and exam experiences to be modern, fast, and friendly on mobile while ensuring CA seat-time compliance. Adopt the `modernTheme` everywhere students study or test, strengthen seat-time integrity (idle & tab-blur pause), and improve accessibility.

### Features

#### Engagement Tracking & Seat-Time Integrity
- **IdleTracker** - Client-side engagement tracking with configurable timeouts
- **Heartbeat API** - Server-side engagement logging and analytics
- **Tab/Window Monitoring** - Pause tracking when user switches tabs or windows
- **CA Compliance** - Ensures accurate seat-time tracking for regulatory requirements

#### Modern Learn v2 Components
- **UnitHeader** - Sticky header with progress bar and navigation
- **StickyActions** - Fixed bottom navigation with Previous/Next controls
- **ReadingProgress** - Visual progress indicator with section navigation
- **Mobile-First** - Responsive design optimized for touch interactions

#### QuizPlayer v2
- **Accessibility** - Full keyboard navigation and screen reader support
- **Modern UI** - Progress tracking, immediate feedback, celebration animations
- **Mobile Optimized** - Touch-friendly interface with gesture support
- **Keyboard Shortcuts** - Arrow keys for navigation, Enter for submission

#### ExamPlayer v2
- **Advanced Features** - Time management, question flagging, review system
- **Pause/Resume** - Exam pause functionality with overlay
- **Progress Tracking** - Detailed progress with answered/flagged counts
- **Accessibility** - WCAG 2.2 AA compliance with keyboard shortcuts

#### Resume Helper & AppBar Integration
- **Smart Resume** - Shows last accessed unit/quiz with progress
- **AppBar CTA** - Resume button in navigation for quick access
- **Progress Summary** - Overall progress and time spent tracking
- **Contextual** - Relevant information based on user state

#### Confetti Celebrations
- **Lightweight** - Canvas-based animations with performance optimization
- **Accessible** - Respects `prefers-reduced-motion` user preference
- **Customizable** - Configurable colors, shapes, and effects
- **Performance** - Optimized for smooth animations

### Database Schema

The migration `0019_learner_ux_polish.sql` adds:
- `last_seen_tip` - Track when user last saw a tip
- `last_seen_celebration_at` - Track celebration timestamps
- `allow_confetti` - User preference for confetti animations

### API Endpoints

#### Engagement Tracking
- `POST /api/progress/heartbeat` - Update user engagement status

### Component Architecture

#### IdleTracker
```typescript
const { startTracking, stopTracking, getState } = useIdleTracker({
  idleTimeoutMs: 300000, // 5 minutes
  heartbeatIntervalMs: 30000, // 30 seconds
  onIdle: () => handleIdle(),
  onActive: () => handleActive(),
  onHeartbeat: () => sendHeartbeat(),
});
```

#### Confetti
```typescript
const { fire, stop } = useConfetti();

// Fire confetti on correct answer
fire({
  particleCount: 30,
  spread: 60,
  origin: { x: 0.5, y: 0.3 },
});
```

### Accessibility Features

#### WCAG 2.2 AA Compliance
- **Keyboard Navigation** - Full keyboard accessibility
- **Screen Reader Support** - Proper ARIA labels and live regions
- **Focus Management** - Visible focus indicators
- **Color Contrast** - Meets AA standards
- **Reduced Motion** - Respects user preferences

#### Keyboard Shortcuts
- **Quiz Navigation**: Arrow keys for choices, Enter for submission
- **Exam Navigation**: Arrow keys, Space for pause, F for flag, R for review

### Mobile Experience

#### Responsive Design
- **Mobile-First** - Designed for mobile devices first
- **Touch-Friendly** - Minimum 44px touch targets
- **Gesture Support** - Swipe navigation where appropriate
- **Performance** - Optimized for mobile performance

### Internationalization

#### Supported Languages
- **English (EN)** - Primary language
- **Spanish (ES)** - Secondary language

#### Key Translation Categories
- **Navigation** - Previous, Next, Submit, etc.
- **Feedback** - Correct, Incorrect, Loading, etc.
- **Accessibility** - Keyboard shortcuts, ARIA labels
- **Progress** - Time tracking, completion status
- **Celebrations** - Success messages and animations

### Testing

#### Unit Tests
- **IdleTracker** - Engagement tracking functionality
- **Confetti** - Animation and accessibility features
- **Components** - Individual component behavior

#### E2E Tests
- **Learner Flow** - Complete learning experience
- **Quiz Experience** - Quiz interaction and feedback
- **Exam Experience** - Exam functionality and features
- **Accessibility** - Keyboard navigation and screen reader support
- **Mobile** - Responsive design and touch interactions

### Performance Considerations

#### Optimization
- **Lazy Loading** - Components loaded on demand
- **Memoization** - React.memo for expensive components
- **Debouncing** - User input debouncing
- **Virtual Scrolling** - For large lists (future)

### Configuration

#### Environment Variables
```bash
# Engagement tracking
NEXT_PUBLIC_IDLE_TIMEOUT_MS=300000
NEXT_PUBLIC_HEARTBEAT_INTERVAL_MS=30000

# Accessibility
NEXT_PUBLIC_ENABLE_CONFETTI=true
NEXT_PUBLIC_REDUCED_MOTION=false
```

### Documentation

- **LEARNER_EXPERIENCE.md** - Complete documentation of learner experience features
- **Component API** - Detailed component documentation
- **Accessibility Guide** - Accessibility implementation guide
- **Performance Guide** - Performance optimization guide

## Sprint 20 — Regulatory Reporting & DMV Submission Toolkit

**Intent**: Deliver a complete, admin-only regulatory reporting pipeline that produces tamper-evident ZIP packages containing CSVs, PDFs, and signed manifests for DMV submission.

### Features

#### Regulatory Reporting System
- **Admin Dashboard** (`/admin/compliance`) - Generate reports with dry-run preview
- **Report Generation** - CSV exports for roster, exams, certificates, and seat time
- **Cover Sheet PDF** - Professional summary with counts and metadata
- **Signed Manifest** - JSON with artifact list and HMAC signature for tamper detection
- **ZIP Packages** - Complete bundles ready for DMV submission

#### File Formats
- **roster.csv** - Student enrollment data (name, DOB, address, course info)
- **exams.csv** - Final exam attempts with scores and pass/fail results
- **certs.csv** - Certificate issuance records with official numbers
- **seat_time.csv** - Aggregated seat time tracking by student/course
- **cover.pdf** - Professional cover sheet with summary counts
- **manifest.json** - Signed metadata with SHA256 hashes and HMAC signature

#### Security & Compliance
- **RLS Everywhere** - All regulatory tables require admin role
- **Private Storage** - Files stored in `dmv_reports` bucket (not public)
- **HMAC Signing** - Manifest signed with `REGULATORY_SIGNING_SECRET`
- **Rate Limiting** - API endpoints protected against abuse
- **Content Minimization** - Only necessary data included in reports

#### Multi-State Ready
- **Jurisdiction-Agnostic** - Works with any state via `jurisdiction_configs`
- **CA-First** - Default configuration for California DMV requirements
- **Scalable Storage** - Namespaced paths by jurisdiction and period
- **Configurable** - State-specific requirements via database configuration

### Database Schema

The migration `0017_regulatory_reporting.sql` adds:
- `regulatory_runs` - Track report generation with status and metadata
- `regulatory_artifacts` - Store file metadata with SHA256 hashes
- `v_reg_roster` - View for student enrollment data
- `v_reg_exams` - View for final exam attempts
- `v_reg_certs` - View for certificate issuance
- `v_reg_seat_time_rollup` - View for aggregated seat time
- `dmv_reports` storage bucket (private)

### API Endpoints

#### Report Generation
- `POST /api/admin/regulatory/run` - Generate report (with dry-run support)
- `GET /api/admin/regulatory/runs` - List report runs with pagination
- `GET /api/admin/regulatory/runs/[runId]/download` - Download ZIP package
- `GET /api/admin/regulatory/runs/[runId]/artifacts` - Get artifact metadata

#### Automated Jobs
- `POST /api/admin/jobs/regulatory-monthly` - Generate monthly reports (HMAC protected)

### Usage

#### On-Demand Reports
1. Navigate to `/admin/compliance`
2. Select jurisdiction (default: CA), course, and period
3. Click "Dry Run" to preview counts
4. Click "Generate & Download" for full package

#### Monthly Automation
```bash
# Enable monthly job
REGULATORY_MONTHLY_ENABLED=true
ADMIN_JOB_TOKEN=your-secure-token
REGULATORY_SIGNING_SECRET=your-signing-key

# Trigger manually (for testing)
curl -X POST http://localhost:3000/api/admin/jobs/regulatory-monthly \
  -H "Authorization: Bearer your-secure-token"
```

### Documentation

- **DMV_REPORTING.md** - Complete documentation of file formats, signing method, and operational procedures
- **Operational Runbook** - Troubleshooting, monitoring, and maintenance procedures
- **Compliance Notes** - California DMV requirements and multi-state considerations

### Privacy & Security

- **Admin Only** - All regulatory functions require admin role
- **Secure Storage** - Files stored in private bucket with access controls
- **Audit Trail** - Complete record of all report generation
- **Data Minimization** - Only necessary data included in reports
- **7-Year Retention** - Regulatory requirement for all records

## Sprint 21 — Billing Lifecycle, Dunning & Self-Serve Management

**Intent**: Harden revenue operations end-to-end with robust Stripe lifecycle handling, automated dunning, and self-serve management capabilities.

### Features

#### Billing Lifecycle Management
- **Invoice Tracking**: Complete invoice history with Stripe sync
- **Dunning System**: Automated payment failure handling with state machine
- **Subscription Management**: Cancel/resume with period-end handling
- **Entitlement Control**: Automatic access revocation based on payment status

#### Dunning Workflow
- **State Machine**: `none → email_1 → email_2 → email_3 → canceled`
- **Email Sequence**: Progressive urgency with 3-day and 7-day intervals
- **Automatic Actions**: Subscription cancellation after final notice
- **Admin Override**: Manual dunning email sending and subscription management

#### Self-Serve Features
- **Billing Summary**: Real-time subscription status and payment history
- **Invoice Access**: View and download invoices with Stripe portal integration
- **Cancel/Resume**: Self-service subscription management
- **Payment Updates**: Direct links to Stripe portal for payment method updates

#### Admin Dashboard
- **KPIs**: Active subscriptions, past due count, MRR, churn rates
- **Past Due Management**: User list with dunning states and manual actions
- **Invoice Overview**: Recent invoices with user context and download links
- **Real-time Monitoring**: Live data with refresh capabilities

### Database Schema

The migration `0018_billing_lifecycle.sql` adds:
- `billing_invoices` - Invoice tracking with Stripe sync
- `billing_dunning` - Dunning state machine and scheduling
- `v_billing_summary_my` - User billing summary view
- RLS policies for secure access control

### API Endpoints

#### User Self-Serve
- `GET /api/billing/summary` - User billing summary
- `GET /api/billing/invoices` - User invoice history
- `POST /api/billing/cancel` - Cancel subscription at period end
- `POST /api/billing/resume` - Resume canceled subscription

#### Admin Management
- `GET /api/admin/billing/kpis` - Billing KPIs and metrics
- `GET /api/admin/billing/past-due` - Past due users with dunning info
- `GET /api/admin/billing/invoices` - Recent invoices with user context

#### Automated Jobs
- `POST /api/admin/jobs/dunning-daily` - Daily dunning processing (HMAC protected)
- `POST /api/admin/jobs/trial-reminders` - Trial end reminders (HMAC protected)

#### Email Templates

##### Payment Failure Sequence
- **Email 1**: Immediate notification with payment method update instructions
- **Email 2**: 3-day follow-up with increased urgency
- **Email 3**: 7-day final notice with cancellation warning

##### Other Templates
- **Payment Success**: Confirmation of successful payment
- **Trial Reminders**: 3-day and 1-day pre-trial end notifications
- **Cancellation Confirmation**: Subscription cancellation confirmation

#### Environment Configuration

```bash
# Dunning Configuration
DUNNING_EMAIL_DAY_1=now
DUNNING_EMAIL_DAY_2=3
DUNNING_EMAIL_DAY_3=7

# Admin Jobs
DUNNING_DAILY_ENABLED=true
TRIAL_REMINDERS_ENABLED=true
ADMIN_JOB_TOKEN=your-secure-token

# Stripe Portal
STRIPE_PORTAL_RETURN_URL=http://localhost:3000/billing
```

#### Usage

##### User Experience
1. Visit `/billing` to view subscription status and payment history
2. Use "Manage Billing" to access Stripe portal for payment updates
3. Cancel/resume subscription with immediate feedback
4. View invoice history with download links

##### Admin Operations
1. Access `/admin/billing` for comprehensive billing overview
2. Monitor past due subscriptions with dunning state visibility
3. Send manual dunning emails or cancel subscriptions
4. Review recent invoices with user context

##### Automated Processing
```bash
# Daily dunning job (cron recommended)
curl -X POST http://localhost:3000/api/admin/jobs/dunning-daily \
  -H "Authorization: Bearer your-secure-token"

# Trial reminders (daily cron)
curl -X POST http://localhost:3000/api/admin/jobs/trial-reminders \
  -H "Authorization: Bearer your-secure-token"
```

#### Privacy & Security

- **RLS Everywhere**: All billing data protected by Row Level Security
- **Admin-Only Access**: Dunning data restricted to admin users
- **HMAC Protection**: Admin jobs secured with token authentication
- **No Service Role in Browser**: All Stripe operations server-side only
- **Audit Trail**: Complete billing event logging for compliance

## Sprint 19 — Launch Cutover

**Intent**: Implement production-ready release machinery for safe CA deployment while maintaining scale-readiness for multi-state expansion.

### Release Workflows

- **Staging Gate**: Automated deployment to staging with lint→build→migrate→RLS audit→E2E tests
- **Production Promotion**: Manual approval required, then migrate→audit→smoke tests
- **Required Secrets**: Supabase access tokens, database URLs, test tokens for both environments

### Security & Compliance

- **RLS Audit**: Automated check ensures all public tables have RLS enabled with ≥1 policy
- **No Client Secrets**: Database URLs and service role keys never exposed to client code
- **Fail-Fast Pipelines**: Misconfigurations cause immediate pipeline failure

### Health & Telemetry

- **Build Metadata**: `/api/health` endpoint includes environment, commit SHA, and build timestamp
- **Version Tracking**: All deployments tagged with exact commit and build time
- **No Runtime Dependencies**: Health endpoint works without additional environment variables

### Backup & Recovery

- **Automated Backups**: Database snapshots created before each staging deployment
- **Artifact Storage**: Backups stored as GitHub Actions artifacts for disaster recovery
- **Local Development**: Helper scripts for local backup/restore operations

### Documentation

- **Runbooks**: Complete procedures for release, backup/restore, and secret rotation
- **Disaster Recovery**: Quarterly drill procedures to validate backup integrity
- **Secret Rotation**: Step-by-step guides for all service integrations

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
   STRIPE_PORTAL_RETURN_URL=http://localhost:3000/billing
   
   # Dunning Configuration
   DUNNING_EMAIL_DAY_1=now
   DUNNING_EMAIL_DAY_2=3
   DUNNING_EMAIL_DAY_3=7
   
   # Admin Jobs
   DUNNING_DAILY_ENABLED=true
   TRIAL_REMINDERS_ENABLED=true
   ADMIN_JOB_TOKEN=your-secure-token
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

### Sprint 11: Student Onboarding, Profiles & Enrollment (CA-first, multi‑state ready)

1. **Database Migration**:
   - Apply the profiles and enrollment migration: `supabase db push`
   - Creates `student_profiles`, `enrollments`, and `consents` tables with RLS
   - Creates `v_profile_eligibility` view for completeness checks
   - All tables have proper RLS policies for user data protection

2. **Student Profiles**:
   - **PII Storage**: Names, DOB, address, phone, guardian info (for minors)
   - **RLS Protection**: Users can only access their own profile data
   - **Admin Access**: Admins can read profiles for compliance reporting
   - **Age Calculation**: Automatic minor detection for guardian consent requirements

3. **Enrollment System**:
   - **Course Enrollment**: One active enrollment per course per student
   - **Status Tracking**: Active, canceled, completed enrollment states
   - **Entitlement Validation**: Requires active subscription or Unit 1 free access
   - **RLS Policies**: Students can only manage their own enrollments

4. **Consent Tracking**:
   - **E-sign Audit**: Terms, privacy, and guardian consent records
   - **IP & User Agent**: Captures consent context for compliance
   - **Automatic Updates**: Terms/privacy consents update profile timestamps
   - **Guardian Consent**: Required for students under 18 with annual renewal

5. **Onboarding Wizard** (`/onboarding`):
   - **Multi-step Flow**: About you → Address → Guardian (if minor) → Agreements → Review
   - **MUI Components**: All UI uses Material-UI with no custom CSS
   - **Validation**: Real-time field validation and step progression
   - **Guardian Step**: Conditionally shown for students under 18
   - **Consent Recording**: Automatically records all consent events

6. **Dashboard** (`/dashboard`):
   - **Welcome Card**: Personalized greeting with student name
   - **Progress Summary**: Active enrollments and total seat time
   - **Exam Eligibility**: Status chip with detailed requirements
   - **Profile Banner**: Prominent warning if profile incomplete
   - **Quick Actions**: Continue learning, edit profile, manage subscription

7. **Profile Management** (`/profile`):
   - **Editable Form**: All profile fields can be updated
   - **Guardian Section**: Conditionally shown for minors
   - **Validation**: Required field validation and error handling
   - **Save/Cancel**: Proper form state management

8. **API Endpoints**:
   - `GET /api/profile` - Get current user's profile
   - `PUT /api/profile` - Update profile with validation
   - `POST /api/consent` - Record consent events
   - `POST /api/enroll` - Enroll in course with entitlement check
   - `GET /api/enrollments` - Get user's enrollments

9. **Exam & Certificate Gates**:
   - **Profile Completeness**: Required fields + terms/privacy acceptance
   - **Minor Protection**: Guardian consent required for students under 18
   - **412 Status**: Certificate issuance fails with detailed missing fields
   - **Backward Compatibility**: Existing flows continue to work

10. **Security & Compliance**:
    - **PII Scrubbing**: Sentry configuration redacts all PII fields
    - **RLS Policies**: All user data protected by row-level security
    - **No Service Role**: Client-side never uses service role keys
    - **Consent Audit**: Complete audit trail of all consent events

11. **Multi-state Ready**:
    - **Config-driven**: Uses `jurisdiction_configs` for state-specific rules
    - **No Code Changes**: Additional states can be added via database config
    - **Guardian Policies**: Age thresholds and consent requirements configurable
    - **Address Validation**: State-specific address requirements

12. **Environment Variables**:
    ```bash
    # No new environment variables required
    # All configuration uses existing jurisdiction_configs table
    ```

13. **Manual Test Flow**:
    ```bash
    # 1) Apply migration
    supabase db push
    
    # 2) Create new user account
    # 3) Visit /dashboard - should show profile completion banner
    # 4) Click "Complete Profile" to start onboarding
    # 5) Complete onboarding wizard:
    #    - Fill personal information
    #    - Enter address details
    #    - Guardian info (if under 18)
    #    - Accept terms and privacy
    #    - Review and finish
    # 6) Verify dashboard shows complete profile
    # 7) Test exam eligibility reflects profile completeness
    # 8) Test certificate issuance requires complete profile
    # 9) Edit profile at /profile
    # 10) Test minor user flow with guardian consent
    ```

14. **Schema Overview**:
    - **student_profiles**: One row per user with PII (names, DOB, address, guardian)
    - **enrollments**: User ↔ course relationships with status tracking
    - **consents**: Audit trail of e-sign events (terms, privacy, guardian)
    - **v_profile_eligibility**: View for completeness checks across enrollments

15. **Minor/Guardian Handling**:
    - **Age Detection**: Automatic calculation from DOB
    - **Guardian Required**: Students under 18 must provide guardian information
    - **Consent Renewal**: Guardian consent expires after 1 year
    - **Exam Blocking**: Minors cannot take exam without valid guardian consent
    - **Certificate Blocking**: Certificate issuance blocked for minors without consent

16. **Configuration Integration**:
    - **Disclaimer Text**: Uses `jurisdiction_configs.disclaimer` for agreements
    - **Age Thresholds**: Guardian requirements configurable per jurisdiction
    - **Required Fields**: Profile completeness rules can be customized
    - **Consent Types**: Additional consent types can be added via database

### Sprint 12: Guardian e‑Signature, Consent PDFs & Audit Trail

**Intent**: Complete the minor/guardian compliance story end‑to‑end with email‑verified guardian consent, public signing pages, PDF receipts, and immutable audit records.

1. **Database Schema** (`0012_guardian_esign.sql`):
   - **guardian_requests**: Stores hashed tokens, never raw tokens
   - **guardian_status enum**: pending, verified, expired, canceled
   - **RLS Policies**: Students see own requests, admins see all
   - **v_guardian_latest**: View for latest status per student/course
   - **consents bucket**: Private storage for signed PDFs

2. **Token Security**:
   - **generateToken()**: 32+ byte random → base64url
   - **hashToken()**: SHA-256 → hex digest
   - **Single-use**: Tokens invalidated after consent or expiry
   - **14-day expiry**: Automatic expiration for security

3. **Public Guardian Signing** (`/guardian/[token]`):
   - **No Login Required**: Public page for guardian consent
   - **Masked Student Info**: Shows initials only for privacy
   - **Jurisdiction Disclaimers**: Pulled from `jurisdiction_configs`
   - **Digital Signature**: Typed name + relationship + checkbox
   - **Error Handling**: Expired/invalid/canceled token states

4. **API Endpoints**:
   - `POST /api/guardian/request` - Create consent request (auth required)
   - `GET /api/guardian/status` - Check latest status (auth required)
   - `POST /api/guardian/cancel` - Cancel pending request (auth required)
   - `GET /api/guardian/verify/[token]` - Validate token (public)
   - `POST /api/guardian/consent` - Submit consent (public)
   - `GET /api/admin/guardian/requests` - List requests (admin)
   - `POST /api/admin/guardian/requests/resend` - Resend request (admin)

5. **Onboarding Integration**:
   - **Guardian Step**: Shows current status (pending/verified/expired)
   - **Request Form**: Guardian name and email input
   - **Status Display**: Color-coded chips with appropriate actions
   - **Re-send Capability**: Can resend expired/canceled requests

6. **Admin Tools** (`/admin/guardians`):
   - **Request Management**: Filter by status, student, course
   - **Bulk Actions**: Resend, cancel, download PDFs
   - **Pagination**: Handles large numbers of requests
   - **Status Tracking**: Real-time status updates

7. **PDF Generation**:
   - **Consent Receipts**: Professional PDF with QR code verification
   - **Privacy Protection**: Student initials only, full guardian name
   - **Audit Trail**: IP address, user agent, timestamp
   - **Jurisdiction Content**: Disclaimers and required text
   - **Storage**: Private bucket with signed URLs for access

8. **Email Notifications**:
   - **Request Emails**: Secure links to consent form
   - **Receipt Emails**: PDF download links and verification URLs
   - **Branded Templates**: MUI-compatible HTML design
   - **Support Contact**: Help email for assistance

9. **Exam Integration**:
   - **Minor Detection**: Age calculation from profile DOB
   - **Guardian Check**: Requires verified consent for minors
   - **412 Status**: Returns missing requirements with details
   - **Automatic Updates**: Status checked on eligibility requests

10. **Security & Privacy**:
    - **PII Scrubbing**: Sentry redacts guardian fields and signatures
    - **Token Hashing**: Raw tokens never stored in database
    - **Rate Limiting**: Public endpoints protected against abuse
    - **Audit Records**: Complete trail of all consent events

11. **Environment Variables**:
    ```bash
    APP_BASE_URL=https://your-domain.com  # Required for email links
    SUPPORT_EMAIL=support@your-domain.com  # Help contact in emails
    ```

12. **Manual Test Flow**:
    ```bash
    # 1) Apply migration
    supabase db push
    
    # 2) Create minor user account (under 18)
    # 3) Start onboarding - guardian step should appear
    # 4) Enter guardian info and send request
    # 5) Check email for consent link
    # 6) Open link and complete consent form
    # 7) Verify PDF receipt is generated
    # 8) Check student dashboard shows verified status
    # 9) Test exam eligibility allows minor to proceed
    # 10) Admin: Visit /admin/guardians to manage requests
    # 11) Test expired token returns 410
    # 12) Test admin resend functionality
    ```

13. **Schema Overview**:
    - **guardian_requests**: Request tracking with hashed tokens
    - **v_guardian_latest**: Latest status per student/course
    - **consents**: Guardian consent records with full audit trail
    - **storage.consents**: Private bucket for PDF receipts

14. **Multi-state Ready**:
    - **Jurisdiction Config**: Guardian disclaimers from `jurisdiction_configs`
    - **Age Thresholds**: Configurable per jurisdiction
    - **Content Localization**: State-specific consent language
    - **No Code Changes**: Additional states via database config

### Sprint 14: Question Bank Authoring, Exam Blueprinting & Item Analytics

This sprint introduces a comprehensive question bank management system with exam blueprinting and analytics capabilities.

#### Database Objects

**Question Bank Extensions:**
- `question_bank` table extended with:
  - `status` (draft/approved/archived)
  - `tags` (array for categorization)
  - `version` (tracking changes)
  - `published_at` (when approved)
  - `author_id` and `reviewer_id` (workflow tracking)
  - `source_ref` (external reference)
  - `review_notes` (reviewer feedback)

**Exam Blueprints:**
- `exam_blueprints` table for exam configuration
- `exam_blueprint_rules` table for detailed question selection rules
- Unique constraint ensures one active blueprint per course

**Analytics:**
- `v_item_stats` view provides p_correct, attempts, and usage metrics
- Computed from `attempt_items` and `attempts` tables (last 180 days)

#### Admin UI Usage

**Question Bank Management (`/admin/questions`):**
- Course selector and search/filter capabilities
- Status-based filtering (draft/approved/archived)
- Tag-based filtering and autocomplete
- Question editor with live preview
- Import/export functionality (CSV/JSON)
- Item analytics with p_correct visualization

**Blueprint Management (`/admin/blueprints`):**
- Create/edit blueprints with rule-based question selection
- Rule configuration: skill, count, difficulty range, tag inclusion/exclusion
- Validation ensures rule counts sum to total questions
- Coverage analysis shows available questions per rule
- Activate/deactivate blueprints with confirmation

#### Import/Export Formats

**CSV Import Headers:**
```
course_id,skill,difficulty,stem,choices,answer,explanation,tags,source_sections,source_ref,status
```

**JSON Import Format:**
```json
{
  "questions": [
    {
      "course_id": "uuid",
      "skill": "Traffic Laws",
      "difficulty": 3,
      "stem": "Question text...",
      "choices": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "Explanation...",
      "tags": ["highway", "speed"],
      "source_sections": ["section1", "section2"],
      "source_ref": "DMV_2024_001"
    }
  ]
}
```

#### Blueprint Rule Semantics

**Rule Configuration:**
- `skill`: Must match question bank skill exactly
- `count`: Number of questions to select
- `min_difficulty`/`max_difficulty`: Difficulty range (1-5)
- `include_tags`: Questions must have ALL specified tags
- `exclude_tags`: Questions must have NONE of specified tags

**Validation:**
- Sum of all rule counts must equal blueprint total_questions
- Each rule must have sufficient approved questions available
- Difficulty ranges must be valid (min ≤ max)

#### Exam Fallback Logic

**Blueprint Selection:**
1. Check for active blueprint for course
2. If active blueprint exists:
   - Apply rules sequentially
   - Select questions matching criteria randomly
   - Return 409 if insufficient questions for any rule
3. If no active blueprint:
   - Fall back to existing behavior (random selection)
   - Use jurisdiction config for question count

**Backward Compatibility:**
- Existing exams continue to work without blueprints
- No code changes required for current functionality
- Blueprints are opt-in per course

#### Item Analytics

**Metrics Available:**
- `p_correct`: Proportion of correct answers (0-1)
- `attempts`: Total number of attempts
- `correct_count`: Number of correct answers
- `avg_attempt_score`: Average score on attempts
- `last_seen_at`: Most recent usage

**Visualization:**
- Color-coded chips: <30% (hard), 30-70% (ok), >70% (easy)
- Trend analysis for last 30/90 days
- Export capabilities with analytics data

#### Manual Test Flow

```bash
# 1) Apply migration
supabase db push

# 2) Visit /admin/questions
# 3) Create 10+ questions with different skills and difficulties
# 4) Approve questions by changing status to "approved"
# 5) Visit /admin/blueprints
# 6) Create blueprint with 3 rules totaling N questions
# 7) Activate blueprint
# 8) Start an exam - should use blueprint rules
# 9) View item stats and export CSV
# 10) Test fallback by deactivating blueprint
```

### Sprint 15 — Accessibility (WCAG 2.2 AA), PWA, and SEO/Performance Hardening

**Goal**: Ship an accessible, installable, and fast app. Achieve WCAG 2.2 AA across core flows, add a careful PWA (offline for static assets only; no offline seat‑time), and raise Lighthouse (Perf/Acc/Best/SEO) across key pages.

#### A) Accessibility (WCAG 2.2 AA)

**Global a11y improvements:**
- ✅ Skip to content link rendered as first focusable element
- ✅ All interactive components keyboard reachable with visible focus
- ✅ Proper ARIA attributes and semantic landmarks
- ✅ Alt text for images/icons; decorative icons marked aria-hidden
- ✅ Form controls associated with visible labels
- ✅ Accessibility statement page at `/accessibility`

**MUI theme & focus:**
- ✅ Color contrast ≥ 4.5:1 across theme palette
- ✅ Consistent focus outline using MUI theme overrides
- ✅ No custom CSS files (MUI only)

**Automated a11y checks:**
- ✅ eslint-plugin-jsx-a11y with recommended rules
- ✅ @axe-core/cli for automated testing
- ✅ CI integration with accessibility thresholds

#### B) PWA (Installable app; careful offline)

**Requirements:**
- ✅ Do NOT cache authenticated pages or compliance routes
- ✅ Seat‑time MUST NOT accrue while offline
- ✅ Offline fallback page explains connectivity requirements

**Implementation:**
- ✅ Web app manifest with proper icons and shortcuts
- ✅ Service worker with next-pwa (app dir compatible)
- ✅ Runtime caching strategy:
  - Cache First: static assets (_next/static, fonts, icons)
  - Stale While Revalidate: public pages (/, /courses, /privacy, /terms, /verify/*)
  - Network Only: private/compliance routes (api/**, learn/**, quiz/**, exam/**, etc.)
- ✅ Offline page at `/offline` with EN/ES messaging

#### C) SEO & Performance

**SEO improvements:**
- ✅ robots.txt and sitemap.xml routes
- ✅ Canonical URLs via metadata in root layout
- ✅ OpenGraph & Twitter meta on key pages
- ✅ JSON‑LD Course schema on /courses

**Performance optimizations:**
- ✅ next/font for Roboto/roboto‑mono (no external font blocking)
- ✅ HTTP caching headers for public pages
- ✅ Tree‑shake large libs; lazy‑load admin pages
- ✅ No blocking console.warn/errors in production

**CI gates:**
- ✅ Lighthouse CI with thresholds:
  - Performance ≥ 90
  - Accessibility ≥ 95
  - Best Practices ≥ 95
  - SEO ≥ 90
- ✅ @axe-core/cli CI step scanning key pages

#### D) Manual Testing Checklist

**Accessibility:**
- [ ] Keyboard-only navigation through signup → learn unit → quiz start
- [ ] Screen reader spot check (NVDA/VoiceOver) on /, /courses, signin
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast meets WCAG 2.2 AA standards

**PWA:**
- [ ] Install prompt works on supported browsers
- [ ] /offline renders when disconnected
- [ ] Exam/learn never load offline (Network Only strategy)
- [ ] Static assets cached for offline viewing

**Performance:**
- [ ] Lighthouse scores meet thresholds on key pages
- [ ] No console errors in production build
- [ ] Images optimized with next/Image
- [ ] Fonts load without blocking

#### E) Environment Variables

```bash
# PWA & SEO
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@your-domain.com
NEXT_PUBLIC_SUPPORT_PHONE=1-800-PERMIT

# CI Testing
# No additional variables required for accessibility/PWA testing
```

#### F) Running Tests Locally

```bash
# Install dependencies
cd web && npm install

# Run accessibility linting
npm run lint

# Run axe-core tests (requires server running)
npm run start-ci &
sleep 30
npm run axe:ci

# Run Lighthouse CI locally
npx lhci autorun

# Build and test production build
npm run build
npm run start
```

#### G) CI Integration

The GitHub Actions workflow (`.github/workflows/accessibility-ci.yml`) runs:
- Lighthouse CI with performance/accessibility/SEO thresholds
- axe-core accessibility testing
- ESLint with jsx-a11y rules
- TypeScript type checking

All checks must pass before merge to main/develop branches.

### Sprint 16 — E2E Test Harness, QA Fixtures, and CI Release Gates

**Goal**: Create a deterministic end‑to‑end (E2E) test suite and non‑production "testkit" APIs so we can automatically verify the most important student/guardian/admin flows for California.

#### A) Non‑production Testkit

**Purpose**: Deterministically seed/modify state for E2E without breaking RLS or requiring real providers.

**Security**: Routes under `/api/testkit/**` are only available when `TESTKIT_ON=true` and with correct bearer token. In production, the whole folder returns 404 (dead code via env guard).

**Available endpoints**:
- `POST /api/testkit/reset` — Truncate test data
- `POST /api/testkit/user` — Create user (profile + entitlement opt‑in)
- `POST /api/testkit/enroll` — Enroll user in course
- `POST /api/testkit/seat-time` — Add seat time events
- `POST /api/testkit/entitlement` — Set entitlement active/inactive
- `POST /api/testkit/guardian/request` — Create guardian request for minor
- `POST /api/testkit/exam/blueprint` — Ensure active blueprint exists
- `POST /api/testkit/cert/draft-to-issued` — Issue draft certificate

#### B) Playwright E2E Tests

**Coverage**:
1. **Auth & Onboarding (Adult)** — Sign up, complete onboarding, enroll in course
2. **Guardian e‑sign (Minor)** — Create minor, send guardian request, complete consent
3. **Learn → Seat‑time Gating → Unit Quiz** — Visit unit, confirm quiz gating, complete quiz
4. **Final Exam → Draft Certificate** — Ensure eligibility, start exam, confirm draft certificate
5. **Issue Certificate (Admin)** — Login as admin, issue draft, verify certificate
6. **Public Catalog & i18n** — Visit catalog, toggle language, verify content updates
7. **Accessibility smoke** — Run axe-core on key pages, assert no serious violations

**Test stability**: Uses role-based selectors first, data-testid only if roles are ambiguous.

**Artifacts**: Playwright trace, screenshots on failure, and HTML report uploaded as CI artifacts.

#### C) Running Tests Locally

```bash
# Install dependencies
cd web && npm install

# Install Playwright browsers
npm run test:e2e:install

# Set up environment variables
export TESTKIT_ON=true
export TESTKIT_TOKEN=your-testkit-token
export NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Run E2E tests
npm run test:e2e

# Run with UI (for debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test auth-onboarding.spec.ts
```

#### D) CI Integration

The GitHub Actions workflow includes an E2E job that:
- Installs Playwright browsers
- Builds the application with testkit enabled
- Runs all E2E tests in headless mode
- Uploads artifacts (reports, traces, screenshots) on every run

**Required secrets**:
- `TESTKIT_TOKEN` — Bearer token for testkit API access

#### E) Security Guardrails

- **Never enable testkit in production** — Environment guard + token required
- **No service role on client** — All testkit logic stays server-only
- **Rate limit bypass for testkit only** — Runs in CI environment
- **No real Stripe or email dependencies** — All external services mocked

#### F) Adding New Tests

1. **Create test file** in `web/tests/e2e/`
2. **Use testkit utilities** for deterministic test data
3. **Follow naming convention** — `feature-name.spec.ts`
4. **Use role-based selectors** — Prefer `getByRole()` over `getByTestId()`
5. **Add data-testid** only when roles are ambiguous
6. **Clean up between tests** — Global setup/teardown handles this

#### G) Test Data Management

- **Global setup** creates test users (admin, student, minor)
- **Global teardown** resets all test data
- **Testkit APIs** provide deterministic state manipulation
- **No real external dependencies** — Stripe, email, etc. are mocked

#### H) Environment Variables

```bash
# Required for E2E testing
TESTKIT_ON=true
TESTKIT_TOKEN=your-secure-token
BASE_URL=http://localhost:3000

# Optional for debugging
DEBUG=pw:api  # Playwright API debugging
```

#### I) Manual Testing Checklist

**Testkit Security**:
- [ ] Testkit endpoints return 404 when `TESTKIT_ON=false`
- [ ] Testkit endpoints return 401 with invalid token
- [ ] Testkit endpoints work with valid token

**E2E Test Coverage**:
- [ ] All 7 test suites run green locally
- [ ] Tests complete in < 8 minutes on CI
- [ ] No dependencies on real Stripe or email
- [ ] Artifacts uploaded on failure

**Test Stability**:
- [ ] Role-based selectors used where possible
- [ ] data-testid attributes added for ambiguous elements
- [ ] Tests clean up after themselves
- [ ] No flaky tests or race conditions

## Security, Privacy & Compliance

### Multi-Factor Authentication (MFA)

**Setup for Admins**:
1. Navigate to `/admin/security`
2. Click "Setup MFA" to generate QR code and backup codes
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enter verification code to complete setup
5. Save backup codes securely - they won't be shown again

**Session Management**:
- Admin sessions are considered "recent" if authenticated within 5 minutes
- Sensitive admin actions require recent authentication
- Use "Re-authenticate" button if session is stale

### Data Subject Access Rights (DSAR)

**Data Export**:
- Users can request data export at `/account/privacy`
- Exports include: profile, enrollments, seat time, attempts, certificates
- Certificate PDFs provided via signed URLs (1-hour expiry)
- Exports expire after 7 days

**Account Deletion**:
- Users can request account deletion at `/account/privacy`
- 7-day grace period with email confirmation required
- Certificate numbers retained for compliance
- All personal data permanently deleted after grace period

**Manual Processing**:
- See `PRIVACY_RUNBOOK.md` for manual DSAR procedures
- Background workers process requests automatically
- Manual intervention available if automated processing fails

### Audit Logs

**Tamper-Evident Logging**:
- All sensitive operations logged with HMAC signatures
- Audit logs include: actor, action, object, before/after data, IP, user agent
- Signatures verified automatically in admin audit UI
- Invalid signatures indicate potential tampering

**Admin Audit Interface**:
- View audit logs at `/admin/audit`
- Filter by date, action, object table, actor
- View JSON diffs for before/after data
- Verify signature integrity

**Audit Key Management**:
- Audit key stored in database GUC setting `app.audit_key`
- Key rotation invalidates all existing signatures
- Emergency rotation procedures in `PRIVACY_RUNBOOK.md`

### Bot Protection

**Cloudflare Turnstile Integration**:
- Protects public forms from bot abuse
- Environment variables: `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- Graceful degradation when keys not configured
- Applied to: guardian consent, public contact forms

**Configuration**:
```bash
# Required for production
TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Optional - bypass in development
TURNSTILE_BYPASS=true
```

### Background Workers

**Export Processing**:
- Processes pending data export requests
- Creates ZIP bundles with user data and certificate URLs
- Uploads to Supabase storage bucket "exports"
- Updates export status to "ready"

**Deletion Processing**:
- Processes confirmed deletion requests after grace period
- Executes user deletion via database function
- Voids certificates (doesn't delete numbers)
- Removes user from Supabase Auth

**Worker Security**:
- Protected by `BACKGROUND_WORKER_TOKEN` environment variable
- Workers called via GitHub Actions or Supabase scheduled functions
- No service role keys exposed to client

### Environment Variables

**Security & Privacy**:
```bash
# MFA (optional - uses Supabase Auth TOTP)
MFA_SECRET=your-mfa-secret

# Bot Protection
TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Background Workers
BACKGROUND_WORKER_TOKEN=your-worker-token

# Audit Key (set in Supabase)
# See PRIVACY_RUNBOOK.md for setup
```

### Compliance Monitoring

**Regular Checks**:
- Monitor stuck export/deletion requests
- Verify audit log signatures
- Check background worker health
- Review admin access patterns

**Incident Response**:
- See `INCIDENT_RESPONSE.md` for detailed procedures
- Contact tree and escalation paths defined
- SLOs: 15min response for critical, 1hr for high severity

### Security Best Practices

**RLS Guarantees**:
- All tables have Row Level Security enabled
- Policies enforce user ownership and admin access
- No service role keys exposed to client
- Audit logs capture all sensitive operations

**Certificate Security**:
- Certificate numbers never deleted (compliance)
- Certificate PDFs deleted on account deletion
- Voided certificates marked as "void" status
- Audit trail maintained for all certificate operations
