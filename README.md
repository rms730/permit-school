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
