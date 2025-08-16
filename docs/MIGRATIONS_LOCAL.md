# Local Migrations: Full Chain

## What changed
- Introduced `0011a_auth_compat_local.sql` to satisfy early references to `auth.users` during CLI apply.
- Fixed `0014_question_bank_admin.sql` CTE to expose `stem/choices/answer`.
- Fixed `0017_regulatory_reporting.sql` roster view column names (`dob`, `city`, `state`, `postal_code`).
- Hardened storage bucket + RLS in `0020_modern_shell_settings.sql`.
- Wrapped fragile FKs/logic with `IF to_regclass()` guards across 0011–0024 set.
- Added helpers: `public.is_admin()`, `public.safe_auth_uid()`.

## One-liner to rebuild
```bash
./scripts/local-db-reset.sh
```

## Notes
- Signed URLs circumvent RLS; bucket remains private; owner/admin reads still allowed.
- Shim is safe in cloud (no-ops via IF NOT EXISTS).
- All migrations now apply automatically from clean state.
- Auth compatibility layer provides minimal `auth.users` table during migration apply.
- Helper functions provide resilient admin checks and auth UID extraction.
