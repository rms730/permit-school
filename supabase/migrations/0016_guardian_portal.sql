-- Sprint 18: Guardian Portal & In-App Notifications
-- Guardian reporting views and notification system

-- enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
      'seat_time_milestone',
      'quiz_completed',
      'final_passed',
      'subscription_activated',
      'certificate_issued',
      'guardian_consent_verified',
      'weekly_digest'
    );
  end if;
end$$;

-- notifications: per-user, read-only payload
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null,
  type public.notification_type not null,
  data jsonb not null, -- {course_id, unit_id, minutes, attempt_id, certificate_number, ...}
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Add FK to auth.users defensively
do $$
begin
  if to_regclass('auth.users') is not null then
    execute $ddl$
      alter table public.notifications
      add constraint notifications_user_id_fkey
      foreign key (user_id) references auth.users(id)
      on delete cascade;
    $ddl$;
  else
    raise notice 'auth.users not present at migration time; skipping FK for local apply';
  end if;
end$$;

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- owner can read and mark read
create policy notifications_owner_select
  on public.notifications for select
  using (auth.uid() = user_id);

create policy notifications_owner_update
  on public.notifications for update
  using (auth.uid() = user_id);

-- admin read (support)
create policy notifications_admin_read
  on public.notifications for select
  using (is_admin());

-- guardian reporting views (read-only, RLS respected via underlying tables)
create or replace view public.v_guardian_children as
select
  gl.guardian_id,
  sp.user_id as student_id,
  sp.first_name,
  sp.last_name,
  sp.dob,
  p.role as student_role
from public.guardian_links as gl
join public.student_profiles as sp
  on gl.student_id = sp.user_id
join public.profiles as p
  on sp.user_id = p.id;

-- course progress summary per student (reuses existing tables)
create or replace view public.v_guardian_student_course as
select
  gl.guardian_id,
  ste.student_id,
  ste.course_id,
  j.code as j_code,
  c.code as course_code,
  c.title as course_title,
  coalesce(sum(ste.ms_delta) / 60000.0, 0) as minutes_total,
  coalesce(max(a.score) filter (where a.mode = 'final'), null) as final_exam_score,
  coalesce(max(a.completed_at) filter (where a.mode = 'final'), null) as final_exam_completed,
  exists (
    select 1
    from public.certificates as cert
    where cert.student_id = ste.student_id
      and cert.course_id = ste.course_id
      and cert.status in ('draft','issued')
  ) as has_certificate
from public.guardian_links as gl
join public.seat_time_events as ste
  on gl.student_id = ste.student_id
join public.courses as c
  on ste.course_id = c.id
join public.jurisdictions as j
  on c.jurisdiction_id = j.id
left join public.attempts as a
  on a.student_id = ste.student_id
 and a.course_id = ste.course_id
group by gl.guardian_id, ste.student_id, ste.course_id, j.code, c.code, c.title;
