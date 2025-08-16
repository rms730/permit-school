-- 0011a_auth_compat_local.sql
-- Purpose: Make local CLI migrations resilient when auth schema/tables are not yet provisioned by Supabase Auth.
-- This file is safe in cloud as it uses IF NOT EXISTS and minimal surface area.

-- Ensure schema exists
create schema if not exists auth;

-- Minimal users table to satisfy FKs during migration apply.
-- If the real table already exists (local after auth boot, or in cloud), this is a no-op.
do $$
begin
  if to_regclass('auth.users') is null then
    create table auth.users (
      id uuid primary key,
      email text,
      created_at timestamptz default now()
    );
    comment on table auth.users is 'LOCAL-DEV COMPAT SHIM: present only when Supabase Auth has not yet provisioned.';
  end if;
end$$;

-- Helper: admin check resilient to both auth.jwt() and raw jwt claims in request context.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Helper: safe auth uid extraction when auth extension is not ready
create or replace function public.safe_auth_uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
