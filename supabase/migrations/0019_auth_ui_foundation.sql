-- 0019_auth_ui_foundation.sql
-- Sprint 22: Google Sign-In + Teen-Friendly UX Refresh (Phase 1) + Mobile-First

-- Add new profile fields for Google auth and modern UI
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists preferred_name text;
alter table public.profiles add column if not exists last_login_at timestamptz;
alter table public.profiles add column if not exists ui_variant text not null default 'classic' 
  check (ui_variant in ('classic','modern'));

-- Add index for UI variant queries
create index if not exists profiles_ui_variant_idx on public.profiles(ui_variant);

-- Add index for last login queries (useful for analytics)
create index if not exists profiles_last_login_at_idx on public.profiles(last_login_at);

-- Add comment for documentation
comment on column public.profiles.avatar_url is 'Google OAuth avatar URL';
comment on column public.profiles.preferred_name is 'User preferred display name';
comment on column public.profiles.last_login_at is 'Timestamp of last login for analytics';
comment on column public.profiles.ui_variant is 'UI theme variant: classic or modern';
