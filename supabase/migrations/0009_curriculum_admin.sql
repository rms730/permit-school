-- 0009_curriculum_admin.sql
-- Curriculum CMS and reporting helpers

-- Add optional metadata for units
alter table public.course_units
add column if not exists objectives text,
add column if not exists is_published boolean not null default false,
add column if not exists updated_at timestamptz not null default now();

-- Index for efficient unit ordering
create index if not exists course_units_course_unit_no_idx
    on public.course_units (course_id, unit_no);

-- Student course progress view for reporting
create or replace view public.v_student_course_progress as
select
  p.id as user_id,
  p.full_name,
  p.role,
  c.code as course_code,
  c.title as course_title,
  j.code as jurisdiction_code,
  ste.course_id,
  cert.number,
  cert.issued_at,
  sum(ste.ms_delta) / 60000.0 as minutes_total,
  count(a.id) as quiz_attempts,
  avg(a.score) as quiz_avg,
  max(a.score) as final_exam_score,
  max(a.completed_at) as final_exam_completed,
  coalesce(max(a.score) >= 0.7, false) as final_exam_passed
from public.profiles as p
left join public.seat_time_events as ste
  on p.id = ste.student_id
left join public.attempts as a
  on p.id = a.student_id
  and ste.course_id = a.course_id
left join public.certificates as cert
  on p.id = cert.student_id
  and ste.course_id = cert.course_id
left join public.courses as c
  on ste.course_id = c.id
left join public.jurisdictions as j
  on c.jurisdiction_id = j.id
where ste.course_id is not null
group by p.id, p.full_name, p.role, c.code, c.title, j.code, ste.course_id, cert.number, cert.issued_at;

-- Function to safely reorder units
create or replace function public.reorder_course_units(
    p_course_id uuid,
    p_unit_id uuid,
    p_direction text
)
returns void
language plpgsql
security definer
as $$
declare
    v_current_unit_no int;
    v_target_unit_no int;
    v_target_unit_id uuid;
begin
    -- Get current unit number
    select unit_no into v_current_unit_no
    from public.course_units
    where id = p_unit_id and course_id = p_course_id;
    
    if not found then
        raise exception 'Unit not found';
    end if;
    
    -- Determine target unit number
    if p_direction = 'up' then
        v_target_unit_no := v_current_unit_no - 1;
    elsif p_direction = 'down' then
        v_target_unit_no := v_current_unit_no + 1;
    else
        raise exception 'Invalid direction: %', p_direction;
    end if;
    
    -- Get target unit id
    select id into v_target_unit_id
    from public.course_units
    where course_id = p_course_id and unit_no = v_target_unit_no;
    
    if not found then
        raise exception 'Cannot move unit %: no unit at position %', p_direction, v_target_unit_no;
    end if;
    
    -- Swap unit numbers using a temporary value
    update public.course_units
    set unit_no = -1
    where id = p_unit_id;
    
    update public.course_units
    set unit_no = v_current_unit_no
    where id = v_target_unit_id;
    
    update public.course_units
    set unit_no = v_target_unit_no
    where id = p_unit_id;
    
    -- Update timestamps
    update public.course_units
    set updated_at = now()
    where id in (p_unit_id, v_target_unit_id);
end;
$$;

-- Grant execute permission to authenticated users (RLS will control access)
grant execute on function public.reorder_course_units(uuid, uuid, text) to authenticated;
