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

-- Storage RLS policies for avatars bucket
-- Owner can insert/update/delete within avatars/{auth.uid()}/*
create policy "Users can upload their own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can read avatars (for signed URL access)
create policy "Anyone can read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Add comment for documentation
comment on table storage.objects is 'Avatar files stored in private bucket, accessed via signed URLs';
