-- 0005_curriculum.sql
-- Curriculum tables and seat time tracking

-- Course units (lessons)
CREATE TABLE IF NOT EXISTS public.course_units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    unit_no int NOT NULL CHECK (unit_no > 0),
    title text NOT NULL,
    minutes_required int NOT NULL CHECK (minutes_required BETWEEN 5 AND 240),
    UNIQUE (course_id, unit_no)
);

-- Unit content chunks (mapped to handbook content)
CREATE TABLE IF NOT EXISTS public.unit_chunks (
    unit_id uuid REFERENCES public.course_units(id) ON DELETE CASCADE,
    chunk_id bigint REFERENCES public.content_chunks(id) ON DELETE CASCADE,
    ord smallint NOT NULL CHECK (ord > 0),
    PRIMARY KEY (unit_id, ord)
);

-- Seat time tracking events
CREATE TABLE IF NOT EXISTS public.seat_time_events (
    id bigserial PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.course_units(id) ON DELETE CASCADE,
    ms_delta int NOT NULL CHECK (ms_delta BETWEEN 1000 AND 300000), -- 1s..5min
    created_at timestamptz DEFAULT now()
);

-- Index for seat time queries
CREATE INDEX IF NOT EXISTS seat_time_events_student_unit_idx
    ON public.seat_time_events (student_id, unit_id, created_at);

-- Enable RLS
ALTER TABLE public.course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_time_events ENABLE ROW LEVEL SECURITY;

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

/* ------------------------------------------------------------------ */
/* Seed CA DE-ONLINE course units (no JOINs; no AM05/ST09; alias literals) */
/* ------------------------------------------------------------------ */

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
    'Signs & Signals' AS title,
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
    3 AS unit_no,
    'Right of Way & Turns' AS title,
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
    4 AS unit_no,
    'Parking & Freeway' AS title,
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
    5 AS unit_no,
    'Safety & Sharing the Road' AS title,
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

/* ------------------------------------------------------------------ */
/* Seed unit_chunks using FTS (sqlfluff‑clean)                        */
/* ------------------------------------------------------------------ */

INSERT INTO public.unit_chunks (unit_id, chunk_id, ord)
WITH topics AS (
    SELECT
        cu.id AS unit_id,
        c.jurisdiction_id,
        CASE cu.unit_no
            WHEN 1 THEN 'traffic basics rules laws'
            WHEN 2 THEN 'signs signals traffic control'
            WHEN 3 THEN 'right way turns intersections'
            WHEN 4 THEN 'parking freeway highway'
            WHEN 5 THEN 'safety sharing road pedestrians'
            ELSE 'default search terms'
        END AS search_terms
    FROM public.course_units AS cu
    INNER JOIN public.courses AS c
        ON cu.course_id = c.id
    INNER JOIN public.jurisdictions AS j
        ON c.jurisdiction_id = j.id
    WHERE j.code = 'CA'
      AND c.code = 'DE-ONLINE'
),

cc_ca AS (
    SELECT
        cc.id AS chunk_id,
        cc.jurisdiction_id,
        cc.chunk
    FROM public.content_chunks AS cc
    INNER JOIN public.jurisdictions AS j2
        ON cc.jurisdiction_id = j2.id
    WHERE j2.code = 'CA'
      AND coalesce(cc.chunk, '') <> ''
),

scored AS (
    SELECT
        t.unit_id,
        ccc.chunk_id,
        ts_rank_cd(
            to_tsvector('english'::regconfig, coalesce(ccc.chunk, '')),
            plainto_tsquery('english'::regconfig, t.search_terms)
        ) AS fts_score
    FROM topics AS t
    INNER JOIN cc_ca AS ccc
        ON t.jurisdiction_id = ccc.jurisdiction_id
),

ranked AS (
    SELECT
        unit_id,
        chunk_id,
        row_number() OVER (
            PARTITION BY unit_id
            ORDER BY fts_score DESC, chunk_id ASC
        ) AS ord
    FROM scored
    WHERE fts_score > 0
)

SELECT
    unit_id,
    chunk_id,
    ord
FROM ranked
WHERE ord <= 30
ON CONFLICT (unit_id, ord) DO NOTHING;