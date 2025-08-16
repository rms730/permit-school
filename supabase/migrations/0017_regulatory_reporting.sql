-- 0017_regulatory_reporting.sql
-- Regulatory reporting and DMV submission toolkit (CA-first, multi-state ready)
-- noqa: ST06

-- Regulatory runs table
create table if not exists public.regulatory_runs (
  id uuid primary key default gen_random_uuid(),
  j_code text not null check (char_length(j_code) = 2),
  course_id uuid not null references public.courses(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  status text not null check (status in ('pending','running','succeeded','failed','canceled')) default 'pending',
  started_at timestamptz,
  finished_at timestamptz,
  summary jsonb default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Ensure period is valid
  constraint regulatory_runs_period_check
    check (period_start <= period_end)
);

-- Regulatory artifacts table
create table if not exists public.regulatory_artifacts (
  run_id uuid not null references public.regulatory_runs(id) on delete cascade,
  name text not null,
  storage_path text not null,
  sha256 text not null,
  bytes bigint not null check (bytes >= 0),
  created_at timestamptz not null default now(),
  primary key (run_id, name)
);

-- Create storage bucket for DMV reports
insert into storage.buckets (id, name, public)
values ('dmv_reports', 'dmv_reports', false)
on conflict (id) do nothing;

-- Create indexes
create index if not exists regulatory_runs_jurisdiction_course_period_idx
  on public.regulatory_runs (j_code, course_id, period_start, period_end, status);

create index if not exists regulatory_runs_created_at_idx
  on public.regulatory_runs (created_at desc);

create index if not exists regulatory_artifacts_run_id_idx
  on public.regulatory_artifacts (run_id);

-- Supporting indexes for time-range queries
create index if not exists attempts_completed_at_idx
  on public.attempts (completed_at)
  where completed_at is not null;

create index if not exists certificates_issued_at_idx
  on public.certificates (issued_at)
  where issued_at is not null;

create index if not exists seat_time_events_created_at_idx
  on public.seat_time_events (created_at);

-- Enable RLS
alter table public.regulatory_runs enable row level security;
alter table public.regulatory_artifacts enable row level security;

-- RLS policies for regulatory_runs (admin only)
create policy regulatory_runs_admin_all
  on public.regulatory_runs for all
  using (is_admin());

-- RLS policies for regulatory_artifacts (admin only)
create policy regulatory_artifacts_admin_all
  on public.regulatory_artifacts for all
  using (is_admin());

-- Touch updated_at trigger
drop trigger if exists trg_regulatory_runs_touch on public.regulatory_runs;
create trigger trg_regulatory_runs_touch
  before update on public.regulatory_runs
  for each row execute function public.touch_updated_at();

-- Regulatory reporting views

-- Roster view: one row per enrolled student in period
create or replace view public.v_reg_roster as
with roster_data as (
  select
    p.id as user_id,
    p.full_name,
    sp.dob as date_of_birth,
    sp.city as address_city,
    sp.state as address_state,
    sp.postal_code as address_zip,
    c.id as course_id,
    c.code as course_code,
    c.title as course_title,
    j.code as j_code,
    e.started_at as first_enroll_at
  from public.profiles as p
  inner join public.enrollments as e
    on p.id = e.student_id
  inner join public.courses as c
    on e.course_id = c.id
  inner join public.jurisdictions as j
    on c.jurisdiction_id = j.id
  left join public.student_profiles as sp
    on p.id = sp.user_id
  where e.status = 'active'
    and e.started_at is not null
)

select
  user_id,
  full_name,
  date_of_birth,
  address_city,
  address_state,
  address_zip,
  course_id,
  course_code,
  course_title,
  j_code,
  first_enroll_at
from roster_data;

-- Exams view: final exam attempts in period
create or replace view public.v_reg_exams as
select
  a.student_id as user_id,
  a.id as attempt_id,
  a.started_at,
  a.completed_at,
  a.score,
  c.id as course_id,
  c.code as course_code,
  j.code as j_code,
  (a.score >= 0.8) as passed
from public.attempts as a
inner join public.courses as c
  on a.course_id = c.id
inner join public.jurisdictions as j
  on c.jurisdiction_id = j.id
where a.mode = 'final'
  and a.completed_at is not null;

-- Certificates view: certificates issued in period
create or replace view public.v_reg_certs as
with cert_data as (
  select
    cert.number,
    cert.issued_at,
    cert.student_id,
    c.id as course_id,
    c.code as course_code,
    j.code as j_code
  from public.certificates as cert
  inner join public.courses as c
    on cert.course_id = c.id
  inner join public.jurisdictions as j
    on cert.jurisdiction_id = j.id
  where cert.status = 'issued'
    and cert.issued_at is not null
)

select
  number,
  issued_at,
  student_id,
  course_id,
  course_code,
  j_code
from cert_data;

-- Seat time rollup view: minutes per user/course in period
create or replace view public.v_reg_seat_time_rollup as
with seat_time_summary as (
  select
    ste.student_id as user_id,
    ste.course_id,
    c.code as course_code,
    j.code as j_code,
    sum(ste.ms_delta / 60000.0) as total_minutes
  from public.seat_time_events as ste
  inner join public.courses as c
    on ste.course_id = c.id
  inner join public.jurisdictions as j
    on c.jurisdiction_id = j.id
  group by ste.student_id, ste.course_id, c.code, j.code
)

select
  user_id,
  course_id,
  course_code,
  j_code,
  total_minutes
from seat_time_summary;
