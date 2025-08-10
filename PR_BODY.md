# Sprint 2–4: Tutor MVP, Auth/RBAC, Curriculum & Seat‑Time

## Summary
This PR bundles the work completed across Sprints 2–4:
- Tutor MVP web app (Next.js + MUI, server‑side proxy to Supabase edge function)
- Hybrid RAG (FTS + vector re‑rank) + ingestion tools
- Observability: `tutor_logs` with latency, user_id, model, errors
- Supabase Auth + RBAC (admin‑only `/admin/logs`)
- Curriculum: `course_units`, `unit_chunks` (FTS mapping), `seat_time_events`
- Seat‑time tracking & quiz gating; attempts flow with EWMA mastery
- CI: web build/typecheck/lint; SQLFluff; Prettier; smoke checks

## Changes since origin/main
(auto‑generated shortlog)
* eadfdf5 chore: ensure env and build outputs are gitignored
* 1d04808 rebuild: recreate all migrations to match current schema exactly
* 48ce805 fix(sql): restructure query to avoid window function in WHERE clause
* 33e809a fix(sql): correct CASE statement syntax in curriculum migration
* 93e546e fix(sql): correct column references in curriculum migration
* e93b15f docs: add Sprint 4 documentation and navigation
* 125353a feat(web): add quiz start and quiz player UI
* 83a5a70 feat(web): add course outline and lesson player UI
* 52d9ebe feat(web): add seat time tracking hook
* e9ea067 feat(web): add progress and attempts API routes
* ddd778c feat(sql): add curriculum tables and seat time tracking
* 2f71d66 docs: README auth & RBAC notes
* ab7be1d chore(web): helper script to promote admin
* 1f4a31c feat(web): include user_id in tutor_logs from route session
* 52933d0 feat(web): gate /admin/logs via RLS (no service role on page)
* 83bbeac feat(web): gate /admin/logs via RLS (no service role on page)
* 81bdac4 feat(web): add Supabase Auth (email/password) + middleware
* 476d11f feat(web): add Supabase Auth (email/password) + middleware
* dde6dd0 feat(web): add Supabase Auth (email/password) + middleware
* e19d6af docs: README notes for Sprint 2
* e6ff525 feat(web): admin logs page (SSR, MUI only)
* 59bf4a4 feat(web): add CA/TX state picker to Tutor UI
* 9c8da46 feat(web): log tutor calls with latency + error to tutor_logs
* a049add feat(web): server-side supabase admin client
* 6502c48 feat(sql): add tutor_logs table + RLS (admin read)
* 35d1182 chore(web): remove TypeScript build info file
* a3d74c8 chore(web): ignore TypeScript build info files
* 36b0cda docs: README quickstart for web
* 24d6532 ci(web): add build/lint/typecheck workflow
* 4f1ecfe feat(web): scaffold Next.js app with MUI theme + SSR cache

## How to test
1. Apply migrations (0001–0005) on a fresh Supabase project.
2. Ingest CA handbook:
   - `npm --prefix tools/ingest run ingest:ca:en -- --url "https://www.dmv.ca.gov/portal/file/california-driver-handbook-pdf" --source "https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/"`
3. Run web app:
   - `cp web/.env.example web/.env.local` and fill keys
   - `npm --prefix web run dev` → open http://localhost:3000
4. Tutor:
   - Ask: "When can I turn right on red in California?" → see answer + citations
5. Curriculum:
   - `/course/CA/DE-ONLINE` → start Unit 1
   - Study content → seat‑time accrues, auto‑saves
   - Quiz unlocks after required minutes; complete quiz → mastery updates
6. Admin:
   - Promote user via script, open `/admin/logs` → see latest 50 entries

## Security notes
- Client only uses `NEXT_PUBLIC_SUPABASE_*` keys.
- Server‑only keys (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_FUNCTIONS_URL`) stay on server.
- RLS enforced across user‑owned tables; admin‑only policies for logs.

## Checklist
- [x] Prettier clean
- [x] ESLint clean
- [x] Typecheck passes
- [x] Build succeeds
- [x] SQLFluff clean
- [x] No env/build artifacts tracked
