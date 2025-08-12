-- sqlfluff: dialect=postgres
-- DMV handbook sources (private storage + admin-only table)

-- storage bucket (private)
insert into storage.buckets (id, name, public)
values ('handbooks', 'handbooks', false)
on conflict (id) do nothing;

-- table to track uploaded artifacts
create table if not exists public.handbook_sources (
  id text primary key,                           -- e.g., 'dl-600-en-2025'
  lang text not null check (lang in ('en','es')),
  title text not null,
  edition text,                                  -- DL 600
  revision text,                                 -- 'R6/2025'
  source_url text,
  license text,
  storage_path text,                             -- storage path after upload
  filename text not null,
  bytes bigint check (bytes >= 0),
  sha256 text not null,
  pages int,
  created_at timestamptz not null default now()
);

alter table public.handbook_sources enable row level security;

-- Admin-only full access
drop policy if exists handbook_sources_admin_all on public.handbook_sources;
create policy handbook_sources_admin_all
  on public.handbook_sources
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- NOTE: bucket is private; reads must be via signed URLs from server.
