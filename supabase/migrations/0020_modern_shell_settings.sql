-- 0020_modern_shell_settings.sql
-- Sprint 24: Full Modern Rollout (Phase 3) - Settings, Account, Nav Shell, Avatars, Google One-Tap

-- Extend profiles table with theme preferences and marketing opt-in
alter table public.profiles add column if not exists theme_pref text not null default 'system' 
  check (theme_pref in ('system','light','dark'));

alter table public.profiles add column if not exists marketing_opt_in boolean not null default false;

-- Add index for theme preference queries
create index if not exists profiles_theme_pref_idx on public.profiles(theme_pref);

-- Add index for marketing opt-in queries
create index if not exists profiles_marketing_opt_in_idx on public.profiles(marketing_opt_in);

-- Add comments for documentation
comment on column public.profiles.theme_pref is 'User theme preference: system, light, or dark';
comment on column public.profiles.marketing_opt_in is 'User consent for marketing communications';

-- Create storage bucket for avatars (private by default)
insert into storage.buckets (id, name, public) 
values ('avatars','avatars', false) 
on conflict (id) do nothing;

-- Storage RLS policies for avatars bucket (robust version)
-- Owner write policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'avatars-owner-write'
  ) then
    create policy "avatars-owner-write"
      on storage.objects
      for all
      to authenticated
      using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = safe_auth_uid()::text
      )
      with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = safe_auth_uid()::text
      );
  end if;
end$$;

-- Owner read (signed URLs bypass RLS, but allow owner/admin anyway)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'avatars-owner-read'
  ) then
    create policy "avatars-owner-read"
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'avatars'
        and (
          (storage.foldername(name))[1] = safe_auth_uid()::text
          or is_admin()
        )
      );
  end if;
end$$;
