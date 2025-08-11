-- guardian consent request & receipt, sqlfluff-compliant

-- enum for guardian request status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'guardian_status') then
    create type public.guardian_status as enum ('pending','verified','expired','canceled');
  end if;
end$$;

-- requests table: stores a hashed token, never the raw token
create table if not exists public.guardian_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  guardian_name text not null,
  guardian_email text not null,
  token_hash text not null, -- sha256 hex digest
  status public.guardian_status not null default 'pending',
  expires_at timestamptz not null,
  verified_at timestamptz,
  verified_ip inet,
  verified_user_agent text,
  consent_id bigint references public.consents(id),
  created_at timestamptz not null default now()
);

alter table public.guardian_requests enable row level security;

create index if not exists guardian_requests_student_idx
  on public.guardian_requests (student_id, status, expires_at desc);

create index if not exists guardian_requests_token_hash_idx
  on public.guardian_requests (token_hash) where status = 'pending';

-- RLS: students see their own requests; admins see all; inserts limited to self or admin
create policy guardian_requests_select_own
  on public.guardian_requests for select
  using (auth.uid() = student_id);

create policy guardian_requests_insert_own
  on public.guardian_requests for insert
  with check (auth.uid() = student_id);

create policy guardian_requests_admin_all
  on public.guardian_requests for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- consents bucket for signed PDFs (separate from certificates)
insert into storage.buckets (id, name, public)
values ('consents', 'consents', false)
on conflict (id) do nothing;

-- helpful view: latest guardian status per student/course
create or replace view public.v_guardian_latest as
select distinct on (gr.student_id, gr.course_id)
  gr.student_id,
  gr.course_id,
  gr.status,
  gr.expires_at,
  gr.verified_at,
  gr.consent_id
from public.guardian_requests as gr
order by gr.student_id asc, gr.course_id asc, gr.created_at desc;

-- NOTE: public.consents exists from Sprint 11. We record final 'guardian' consent there
-- with ip/ua and link it from guardian_requests.consent_id.
