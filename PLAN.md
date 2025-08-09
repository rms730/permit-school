# PLAN

This file is consumed by Planner/Coder/Reviewer agents.

## Backlog (first 2 weeks)

1) **Supabase bootstrap**
   - Apply `supabase/migrations/0001_init.sql` (RLS on).
   - Create admin user with `app_metadata.role=admin`.
   - Enable Storage buckets: `visuals` (public read), `certs` (admin read).

2) **Handbook ingestion (CA first)**
   - Download CA Driver Handbook (EN; ES optional).
   - Chunk, embed with text-embedding-3-large (3072 dims).
   - Upsert into `content_chunks` (lang `en|es`, jurisdiction `CA`).

3) **Tutor MVP**
   - RAG endpoint: query `content_chunks` by similarity; cite section refs.
   - System prompt `ops/prompts/tutor_system.txt`.
   - Simple web UI page with chat, bilingual toggle.

4) **Adaptive practice**
   - Seed `question_bank` for Signs/Right-of-Way/Speed/Lane Control.
   - Implement generator + verifier; store to `question_bank`.
   - Quiz UI; store `attempts` + `attempt_items`; update `skill_mastery`.

5) **Compliance gates**
   - Unit structure for 30‑hour equivalence (CA).
   - Time-on-task tracking and mastery gates in `unit_progress`.
   - Final exam + threshold; queue `certificates` on pass.

6) **Visuals pipeline**
   - Pull official sign SVGs (store in /assets or Supabase Storage).
   - `renderScene.ts` overlays signs on generated backgrounds.
   - n8n `visuals` workflow with budget cap from `ops/config/budgets.json`.

7) **Payments & ops**
   - Stripe Checkout for $9.99.
   - Admin dashboard for attempts, mastery, certificates queue.
   - Shipping integration for certificates.
