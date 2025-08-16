-- 0026a_auth_cleanup_local.sql
-- Harmless cleanup: only runs if our shim was used and the real `auth.users` now exists with expected columns.
do $$
begin
  -- if real auth.users exists with more than just id, we assume Auth is fully provisioned; nothing to drop (our shim is the same table).
  -- No action required unless you had created separate shim artifacts. This file reserved for future use.
  raise notice 'Auth cleanup: nothing to do';
end$$;
