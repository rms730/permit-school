-- 0010_jurisdiction_config.sql
-- Platformize for multi-state with DB-backed configuration

-- jurisdiction-level runtime config
create table if not exists public.jurisdiction_configs (
  jurisdiction_id uuid primary key references public.jurisdictions(id) on delete cascade,
  final_exam_questions int not null default 30,
  final_exam_pass_pct numeric not null check (final_exam_pass_pct > 0 and final_exam_pass_pct <= 1) default 0.8,
  seat_time_required_minutes int not null default 150,
  certificate_prefix text not null default 'GEN',
  disclaimer text,
  support_email text,
  terms_url text,
  privacy_url text,
  updated_at timestamptz not null default now()
);

-- pricing table (server-side lookup only)
create table if not exists public.billing_prices (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  stripe_price_id text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course_id, stripe_price_id)
);

create index if not exists billing_prices_course_active_idx
  on public.billing_prices (course_id, active);

-- course catalog view
create or replace view public.v_course_catalog as
with priced as (
  select
    c.id as course_id,
    j.code as j_code,
    c.code as course_code,
    c.title as course_title,
    exists(
      select 1
      from public.billing_prices as bp
      where bp.course_id = c.id
        and bp.active = true
    ) as has_price
  from public.courses as c
  inner join public.jurisdictions as j
    on c.jurisdiction_id = j.id
)

select
  p.j_code,
  p.course_code,
  p.course_id,
  p.course_title,
  p.has_price
from priced as p;

-- enable RLS
alter table public.jurisdiction_configs enable row level security;
alter table public.billing_prices enable row level security;

-- RLS policies
create policy jurisdiction_configs_public_select
  on public.jurisdiction_configs for select
  using (true);

create policy jurisdiction_configs_admin_write
  on public.jurisdiction_configs for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy billing_prices_admin_all
  on public.billing_prices for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- certificate number sequence
create sequence if not exists certificate_no_seq;

-- certificate number function (prefix from config)
create or replace function public.make_certificate_number(j_code text)
returns text
language plpgsql
volatile
as $$
declare
  prefix text;
begin
  select coalesce(jc.certificate_prefix, j.code)
    into prefix
  from public.jurisdictions as j
  left join public.jurisdiction_configs as jc
    on jc.jurisdiction_id = j.id
  where j.code = j_code;

  return format(
    '%s-%s-%06s',
    prefix,
    to_char(now(), 'yyyy'),
    nextval('certificate_no_seq')::text
  );
end;
$$;

-- seed CA jurisdiction config
insert into public.jurisdiction_configs (
  jurisdiction_id,
  final_exam_questions,
  final_exam_pass_pct,
  seat_time_required_minutes,
  certificate_prefix,
  disclaimer,
  support_email,
  terms_url,
  privacy_url
)
select
  j.id as jurisdiction_id,
  30 as final_exam_questions,
  0.8 as final_exam_pass_pct,
  150 as seat_time_required_minutes,
  'CA' as certificate_prefix,
  'This course meets California DMV requirements for driver education.' as disclaimer,
  'support@permit-school.com' as support_email,
  '/terms' as terms_url,
  '/privacy' as privacy_url
from public.jurisdictions as j
where j.code = 'CA'
on conflict (jurisdiction_id) do update set
  final_exam_questions = excluded.final_exam_questions,
  final_exam_pass_pct = excluded.final_exam_pass_pct,
  seat_time_required_minutes = excluded.seat_time_required_minutes,
  certificate_prefix = excluded.certificate_prefix,
  disclaimer = excluded.disclaimer,
  support_email = excluded.support_email,
  terms_url = excluded.terms_url,
  privacy_url = excluded.privacy_url,
  updated_at = now();
