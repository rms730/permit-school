-- 0002_curriculum_admin.sql
-- Curriculum tables, admin features, and seat time tracking

-- Unit content chunks (mapped to handbook content)
CREATE TABLE IF NOT EXISTS public.unit_chunks (
    unit_id uuid REFERENCES public.course_units(id) ON DELETE CASCADE,
    chunk_id bigint REFERENCES public.content_chunks(id) ON DELETE CASCADE,
    ord smallint NOT NULL CHECK (ord > 0),
    PRIMARY KEY (unit_id, ord)
);

-- Add unique constraint to course_units if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'course_units_course_unit_unique'
    ) THEN
        ALTER TABLE public.course_units 
        ADD CONSTRAINT course_units_course_unit_unique 
        UNIQUE (course_id, unit_no);
    END IF;
END $$;

-- Index for seat time queries
CREATE INDEX IF NOT EXISTS seat_time_events_student_unit_idx
    ON public.seat_time_events (student_id, unit_id, created_at);

-- Enable RLS on new tables
ALTER TABLE public.unit_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Course units: public read, admin write
CREATE POLICY "course_units_public_read" ON public.course_units
    FOR SELECT USING (true);

CREATE POLICY "course_units_admin_write" ON public.course_units
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Unit chunks: public read, admin write
CREATE POLICY "unit_chunks_public_read" ON public.unit_chunks
    FOR SELECT USING (true);

CREATE POLICY "unit_chunks_admin_write" ON public.unit_chunks
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seat time events: insert by student, read by owner or admin
CREATE POLICY "seat_time_events_insert_own" ON public.seat_time_events
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "seat_time_events_select_own_or_admin" ON public.seat_time_events
    FOR SELECT
    USING (
        auth.uid() = student_id
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- Seed CA DE-ONLINE course units
INSERT INTO public.course_units (course_id, unit_no, title, minutes_required)
SELECT
    c.id AS course_id,
    1 AS unit_no,
    'Traffic Basics' AS title,
    30 AS minutes_required
FROM public.courses AS c
WHERE
    c.code = 'DE-ONLINE'
    AND EXISTS (
        SELECT 1
        FROM public.jurisdictions AS j
        WHERE j.id = c.jurisdiction_id
          AND j.code = 'CA'
    )
ON CONFLICT (course_id, unit_no) DO NOTHING;

INSERT INTO public.course_units (course_id, unit_no, title, minutes_required)
SELECT
    c.id AS course_id,
    2 AS unit_no,
    'Signs and Signals' AS title,
    25 AS minutes_required
FROM public.courses AS c
WHERE
    c.code = 'DE-ONLINE'
    AND EXISTS (
        SELECT 1
        FROM public.jurisdictions AS j
        WHERE j.id = c.jurisdiction_id
          AND j.code = 'CA'
    )
ON CONFLICT (course_id, unit_no) DO NOTHING;

INSERT INTO public.course_units (course_id, unit_no, title, minutes_required)
SELECT
    c.id AS course_id,
    3 AS unit_no,
    'Safe Driving Practices' AS title,
    35 AS minutes_required
FROM public.courses AS c
WHERE
    c.code = 'DE-ONLINE'
    AND EXISTS (
        SELECT 1
        FROM public.jurisdictions AS j
        WHERE j.id = c.jurisdiction_id
          AND j.code = 'CA'
    )
ON CONFLICT (course_id, unit_no) DO NOTHING;
