-- 0005_curriculum.sql
-- Curriculum tables and seat time tracking

-- Course units (lessons)
create table if not exists public.course_units (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    unit_no int not null check (unit_no > 0),
    title text not null,
    minutes_required int not null check (minutes_required between 5 and 240),
    unique(course_id, unit_no)
);

-- Unit content chunks (mapped to handbook content)
create table if not exists public.unit_chunks (
    unit_id uuid references public.course_units(id) on delete cascade,
    chunk_id bigint references public.content_chunks(id) on delete cascade,
    ord smallint not null check (ord > 0),
    primary key (unit_id, ord),
    unique (unit_id, chunk_id)
);

-- Seat time tracking events
create table if not exists public.seat_time_events (
    id bigserial primary key,
    student_id uuid not null references auth.users(id) on delete cascade,
    course_id uuid not null references public.courses(id) on delete cascade,
    unit_id uuid not null references public.course_units(id) on delete cascade,
    ms_delta int not null check (ms_delta between 1000 and 300000), -- 1s..5min
    created_at timestamptz default now()
);

-- Index for seat time queries
create index if not exists seat_time_events_student_unit_idx 
    on public.seat_time_events (student_id, unit_id, created_at);

-- Enable RLS
alter table public.course_units enable row level security;
alter table public.unit_chunks enable row level security;
alter table public.seat_time_events enable row level security;

-- RLS Policies

-- Course units: public read, admin write
create policy "course_units_public_read" on public.course_units
    for select using (true);

create policy "course_units_admin_write" on public.course_units
    for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Unit chunks: public read, admin write
create policy "unit_chunks_public_read" on public.unit_chunks
    for select using (true);

create policy "unit_chunks_admin_write" on public.unit_chunks
    for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seat time events: insert by student, read by owner or admin
create policy "seat_time_events_insert_own" on public.seat_time_events
    for insert with check (auth.uid() = student_id);

create policy "seat_time_events_select_own_or_admin" on public.seat_time_events
    for select using (
        auth.uid() = student_id or 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- Seed CA DE-ONLINE course units
insert into public.course_units (course_id, unit_no, title, minutes_required)
select 
    c.id as course_id,
    unit_data.unit_no,
    unit_data.title,
    unit_data.minutes_required
from public.courses c
join public.jurisdictions j on c.jurisdiction_id = j.id
cross join (values
    (1, 'Traffic Basics', 30),
    (2, 'Signs & Signals', 30),
    (3, 'Right of Way & Turns', 30),
    (4, 'Parking & Freeway', 30),
    (5, 'Safety & Sharing the Road', 30)
) as unit_data(unit_no, title, minutes_required)
where j.code = 'CA' and c.code = 'DE-ONLINE'
on conflict (course_id, unit_no) do nothing;

-- Seed unit chunks using FTS search
with unit_topics as (
    select 
        cu.id as unit_id,
        cu.title as unit_title,
        case cu.unit_no
            when 1 then 'traffic basics rules laws'
            when 2 then 'signs signals traffic control'
            when 3 then 'right way turns intersections'
            when 4 then 'parking freeway highway'
            when 5 then 'safety sharing road pedestrians'
            else 'default search terms'
        end as search_terms
    from public.course_units cu
    join public.courses c on cu.course_id = c.id
    join public.jurisdictions j on c.jurisdiction_id = j.id
    where j.code = 'CA' and c.code = 'DE-ONLINE'
),
ranked_chunks as (
    select 
        ut.unit_id,
        cc.id as chunk_id,
        row_number() over (partition by ut.unit_id order by 
            ts_rank(to_tsvector('english', cc.chunk), plainto_tsquery('english', ut.search_terms)) desc,
            cc.id asc
        ) as ord
    from unit_topics ut
    cross join public.content_chunks cc
    join public.jurisdictions j2 on cc.jurisdiction_id = j2.id
    where j2.code = 'CA'
        and to_tsvector('english', cc.chunk) @@ plainto_tsquery('english', ut.search_terms)
)
insert into public.unit_chunks (unit_id, chunk_id, ord)
select unit_id, chunk_id, ord
from ranked_chunks
where ord <= 30
on conflict (unit_id, chunk_id) do nothing;
