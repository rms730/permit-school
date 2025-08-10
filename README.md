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
