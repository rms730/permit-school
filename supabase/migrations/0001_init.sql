-- 0001_init.sql
-- Schema bootstrap for multi-state driver-ed platform (CA first, TX next)

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector"; -- pgvector for embeddings

-- Profiles (auth.users is managed by Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','guardian','admin')),
  full_name text,
  locale text default 'en',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Jurisdictions (e.g., CA, TX)
create table if not exists public.jurisdictions (
  id serial primary key,
  code text unique not null check (char_length(code)=2), -- 'CA', 'TX'
  name text not null,
  certificate_type text,        -- e.g., 'DL-400C' (CA), others for TX
  metadata jsonb default '{}'::jsonb
);

insert into public.jurisdictions (code, name, certificate_type)
  values ('CA','California','DL-400C')
on conflict (code) do nothing;

insert into public.jurisdictions (code, name, certificate_type)
  values ('TX','Texas',null)
on conflict (code) do nothing;

-- Courses (per jurisdiction)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id int not null references public.jurisdictions(id) on delete restrict,
  code text not null,         -- e.g., 'DE-ONLINE'
  title text not null,
  price_cents int not null default 999,
  hours_required_minutes int, -- e.g., CA equivalency 30*50=1500
  active boolean default true,
  unique (jurisdiction_id, code)
);

-- Link default course for CA
insert into public.courses (jurisdiction_id, code, title, price_cents, hours_required_minutes)
select j.id, 'DE-ONLINE', 'Online Driver Education', 999, 1500
from public.jurisdictions j where j.code='CA'
on conflict do nothing;

-- Guardian links (many-to-many)
create table if not exists public.guardian_links (
  guardian_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (guardian_id, student_id)
);
alter table public.guardian_links enable row level security;

-- Unit progress + seat time
create table if not exists public.unit_progress (
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  unit_id int not null,
  started_at timestamptz,
  completed_at timestamptz,
  time_ms bigint default 0 check (time_ms >= 0),
  mastery numeric default 0 check (mastery between 0 and 1),
  primary key (student_id, course_id, unit_id)
);
alter table public.unit_progress enable row level security;

-- Attempts (quiz/mock/final) + items
do $$ begin
  create type attempt_mode as enum ('quiz','mock','final');
exception when duplicate_object then null; end $$;

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  mode attempt_mode not null,
  score numeric,
  started_at timestamptz default now(),
  completed_at timestamptz
);
alter table public.attempts enable row level security;

create table if not exists public.attempt_items (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  item_no smallint not null,
  skill text not null,
  stem text not null,
  choices jsonb not null,              -- {A:...,B:...,C:...,D:...}
  answer text not null,                -- "A".."D"
  explanation text,
  correct boolean,
  source_sections text[] default '{}',
  primary key (attempt_id, item_no)
);
alter table public.attempt_items enable row level security;

-- Mastery (EWMA)
create table if not exists public.skill_mastery (
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  skill text not null,
  mastery numeric not null check (mastery between 0 and 1),
  updated_at timestamptz default now(),
  primary key (student_id, course_id, skill)
);
alter table public.skill_mastery enable row level security;

-- Question bank
create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  skill text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  stem text not null,
  choices jsonb not null,
  answer text not null,
  explanation text not null,
  source_sections text[] not null,
  is_generated boolean default false,
  created_at timestamptz default now()
);
alter table public.question_bank enable row level security;

-- RAG corpus
create table if not exists public.content_chunks (
  id bigserial primary key,
  jurisdiction_id int not null references public.jurisdictions(id) on delete cascade,
  section_ref text,
  lang text not null check (lang in ('en','es')),
  source_url text,
  chunk text not null,
  embedding vector(3072)  -- text-embedding-3-large
);
create index if not exists content_chunks_embedding_idx
  on public.content_chunks using ivfflat (embedding vector_cosine_ops);

-- Certificates + serials
do $$ begin
  create type cert_status as enum ('ready','queued','mailed','void');
exception when duplicate_object then null; end $$;

create table if not exists public.certificate_serials (
  jurisdiction_id int not null references public.jurisdictions(id) on delete cascade,
  serial text not null,
  used boolean default false,
  assigned_to uuid references auth.users(id),
  assigned_at timestamptz,
  primary key (jurisdiction_id, serial)
);
alter table public.certificate_serials enable row level security;

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  jurisdiction_id int not null references public.jurisdictions(id) on delete restrict,
  dl_serial text references public.certificate_serials(serial),
  status cert_status not null default 'ready',
  ship_to jsonb not null,              -- {name,address1,city,state,zip}
  passed_at timestamptz not null,
  created_at timestamptz default now()
);
alter table public.certificates enable row level security;

-- RLS: profiles
create policy if not exists "profiles_self_read" on public.profiles
  for select using (id = auth.uid());
create policy if not exists "profiles_self_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy if not exists "profiles_admin_all" on public.profiles
  for all using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- RLS: guardian links
create policy if not exists "gl_read" on public.guardian_links
  for select using (
    guardian_id = auth.uid()
    or student_id = auth.uid()
    or (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
create policy if not exists "gl_write_guardian" on public.guardian_links
  for insert with check (guardian_id = auth.uid());

-- RLS: student-owned tables
create policy if not exists "unit_progress_read" on public.unit_progress
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.guardian_links gl
               where gl.guardian_id = auth.uid() and gl.student_id = unit_progress.student_id)
    or (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
create policy if not exists "unit_progress_write" on public.unit_progress
  for insert with check (student_id = auth.uid());
create policy if not exists "unit_progress_update" on public.unit_progress
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy if not exists "attempts_read" on public.attempts
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.guardian_links gl
               where gl.guardian_id = auth.uid() and gl.student_id = attempts.student_id)
    or (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
create policy if not exists "attempts_write" on public.attempts
  for insert with check (student_id = auth.uid());

create policy if not exists "attempt_items_read" on public.attempt_items
  for select using (
    exists (select 1 from public.attempts a where a.id = attempt_items.attempt_id and
            (a.student_id = auth.uid()
             or (auth.jwt()->'app_metadata'->>'role') = 'admin'
             or exists (select 1 from public.guardian_links gl
                        where gl.guardian_id = auth.uid() and gl.student_id = a.student_id)))
  );

create policy if not exists "skill_mastery_read" on public.skill_mastery
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.guardian_links gl
               where gl.guardian_id = auth.uid() and gl.student_id = skill_mastery.student_id)
    or (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
create policy if not exists "skill_mastery_write" on public.skill_mastery
  for insert with check (student_id = auth.uid());
create policy if not exists "skill_mastery_update" on public.skill_mastery
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Public read tables (question bank, content)
create policy if not exists "qb_public_read" on public.question_bank for select using (true);
create policy if not exists "qb_admin_write" on public.question_bank for all
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy if not exists "chunks_public_read" on public.content_chunks for select using (true);

-- Certificates: student/admin read; writes via service role only
create policy if not exists "cert_student_read" on public.certificates
  for select using (student_id = auth.uid() or (auth.jwt()->'app_metadata'->>'role') = 'admin');
-- No insert/update/delete policies to force server-side writes
