# Security Notes (RLS & Server-only Writes)

## RLS Overview
- RLS is enabled on all student-owned tables (unit_progress, attempts, attempt_items [read], skill_mastery, certificates, certificate_serials) and profiles/guardian_links.
- Public read is intentional on `question_bank` and `content_chunks` for now to allow anonymous browsing. We can tighten later.

## Server-only Writes (by design)
- **certificates** and **certificate_serials**: no INSERT/UPDATE/DELETE policies are defined for client roles—writes must go through Edge Functions or n8n using the **service role** key.
- **attempt_items**: only SELECT is allowed to clients. Item creation happens in trusted server code when grading attempts.
- **question_bank**: admin-only writes via `app_metadata.role = 'admin'`.

## Why this shape?
- Prevents tampering with certification artifacts and exam details.
- Keeps student-owned records writable only by the student (or server) and readable by their linked guardians.

## Next tightenings (future PRs)
- Add per-tenant storage RLS for `visuals/` and `certs/` buckets.
- Move `content_chunks` to authenticated read if we decide to hide content from anon.
- Add row-level constraints for attempt → item inserts in server code paths.
