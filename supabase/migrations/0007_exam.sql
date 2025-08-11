-- 0007_exam.sql
-- Final exam and compliance gating

-- Add 'draft' status to cert_status enum if not exists
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'cert_status'
      and e.enumlabel = 'draft'
  ) then
    alter type cert_status add value 'draft';
  end if;
end $$;

-- Course seat time aggregation view
create or replace view public.v_course_seat_time as
select
  ste.student_id as user_id,
  cu.course_id,
  sum(ste.ms_delta) / 60000.0 as minutes_total
from public.seat_time_events as ste
inner join public.course_units as cu
  on ste.unit_id = cu.id
group by ste.student_id, cu.course_id;
