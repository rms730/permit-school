-- student_profiles: one row per user (PII)
create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  middle_name text,
  dob date not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null default 'CA',
  postal_code text not null,
  guardian_name text,
  guardian_email text,
  guardian_phone text,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- touch updated_at trigger
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_student_profiles_touch on public.student_profiles;
create trigger trg_student_profiles_touch
before update on public.student_profiles
for each row execute procedure public.touch_updated_at();

alter table public.student_profiles enable row level security;

create policy student_profiles_select_own
  on public.student_profiles for select
  using (auth.uid() = user_id);

create policy student_profiles_upsert_own
  on public.student_profiles for insert
  with check (auth.uid() = user_id);

create policy student_profiles_update_own
  on public.student_profiles for update
  using (auth.uid() = user_id);

create policy student_profiles_admin_read
  on public.student_profiles for select
  using (is_admin());

-- enrollments: user ↔ course (one active per course)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'enrollment_status') then
    create type public.enrollment_status as enum ('active','canceled','completed');
  end if;
end$$;

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, course_id)
);

-- Add FK to auth.users defensively
do $$
begin
  if to_regclass('auth.users') is not null then
    execute $ddl$
      alter table public.enrollments
      add constraint enrollments_student_id_fkey
      foreign key (student_id) references auth.users(id)
      on delete cascade;
    $ddl$;
  else
    raise notice 'auth.users not present at migration time; skipping FK for local apply';
  end if;
end$$;

alter table public.enrollments enable row level security;

create index if not exists enrollments_student_course_idx
  on public.enrollments (student_id, course_id);

create policy enrollments_select_own
  on public.enrollments for select
  using (auth.uid() = student_id);

create policy enrollments_upsert_own
  on public.enrollments for insert
  with check (auth.uid() = student_id);

create policy enrollments_update_own
  on public.enrollments for update
  using (auth.uid() = student_id);

create policy enrollments_admin_all
  on public.enrollments for all
  using (is_admin());

-- consents: audit of e-sign events (terms/privacy/guardian)
create table if not exists public.consents (
  id bigserial primary key,
  student_id uuid not null,
  consent_type text not null check (consent_type in ('terms','privacy','guardian')),
  signed_at timestamptz not null default now(),
  ip inet,
  user_agent text,
  payload jsonb
);

-- Add FK to auth.users defensively
do $$
begin
  if to_regclass('auth.users') is not null then
    execute $ddl$
      alter table public.consents
      add constraint consents_student_id_fkey
      foreign key (student_id) references auth.users(id)
      on delete cascade;
    $ddl$;
  else
    raise notice 'auth.users not present at migration time; skipping FK for local apply';
  end if;
end$$;

alter table public.consents enable row level security;

create index if not exists consents_student_type_idx
  on public.consents (student_id, consent_type, signed_at desc);

create policy consents_select_own
  on public.consents for select
  using (auth.uid() = student_id);

create policy consents_insert_own
  on public.consents for insert
  with check (auth.uid() = student_id);

create policy consents_admin_read
  on public.consents for select
  using (is_admin());

-- helper view: eligibility snapshot (profile completeness + seat time)
create or replace view public.v_profile_eligibility as
select
  u.id as user_id,
  c.id as course_id,
  j.code as j_code,
  -- minimal completeness: name, dob, address_line1, city, state, postal, terms & privacy
  (sp.first_name is not null
    and sp.last_name is not null
    and sp.dob is not null
    and sp.address_line1 is not null
    and sp.city is not null
    and sp.state is not null
    and sp.postal_code is not null
    and sp.terms_accepted_at is not null
    and sp.privacy_accepted_at is not null) as is_profile_complete
from public.profiles as u
join public.enrollments as e
  on u.id = e.student_id
join public.courses as c
  on e.course_id = c.id
join public.jurisdictions as j
  on c.jurisdiction_id = j.id
left join public.student_profiles as sp
  on u.id = sp.user_id;
