-- Sprint 14: Question Bank Authoring, Exam Blueprinting & Item Analytics
-- Extend question bank with status/tags/versioning, add blueprints, and analytics

-- Helper function for updated_at trigger (create if missing)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Extend question_bank table with new columns
ALTER TABLE public.question_bank
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS source_ref TEXT,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create indexes for question_bank
CREATE INDEX IF NOT EXISTS question_bank_course_status_idx
    ON public.question_bank (course_id, status);

CREATE INDEX IF NOT EXISTS question_bank_tags_gin_idx
    ON public.question_bank USING gin (tags);

CREATE INDEX IF NOT EXISTS question_bank_search_idx
    ON public.question_bank USING gin (to_tsvector('english', coalesce(stem, '') || ' ' || coalesce(explanation, '')));

-- Add updated_at trigger to question_bank
DROP TRIGGER IF EXISTS question_bank_updated_at_trigger ON public.question_bank;
CREATE TRIGGER question_bank_updated_at_trigger
    BEFORE UPDATE ON public.question_bank
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- Create exam_blueprints table
CREATE TABLE IF NOT EXISTS public.exam_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_questions INT NOT NULL CHECK (total_questions > 0),
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create exam_blueprint_rules table
CREATE TABLE IF NOT EXISTS public.exam_blueprint_rules (
    blueprint_id UUID NOT NULL REFERENCES public.exam_blueprints(id) ON DELETE CASCADE,
    rule_no SMALLINT NOT NULL,
    skill TEXT NOT NULL,
    count INT NOT NULL CHECK (count > 0),
    min_difficulty SMALLINT CHECK (min_difficulty BETWEEN 1 AND 5),
    max_difficulty SMALLINT CHECK (max_difficulty BETWEEN 1 AND 5),
    include_tags TEXT[] DEFAULT '{}'::TEXT[],
    exclude_tags TEXT[] DEFAULT '{}'::TEXT[],
    PRIMARY KEY (blueprint_id, rule_no)
);

-- Create unique constraint for one active blueprint per course
CREATE UNIQUE INDEX IF NOT EXISTS exam_blueprints_one_active_per_course_idx
    ON public.exam_blueprints (course_id)
    WHERE is_active = true;

-- Add updated_at trigger to exam_blueprints
DROP TRIGGER IF EXISTS exam_blueprints_updated_at_trigger ON public.exam_blueprints;
CREATE TRIGGER exam_blueprints_updated_at_trigger
    BEFORE UPDATE ON public.exam_blueprints
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- Create item analytics view (last 180 days)
CREATE OR REPLACE VIEW public.v_item_stats AS
WITH item_attempts AS (
    SELECT
        ai.attempt_id,
        ai.item_no,
        ai.correct,
        ai.stem,
        ai.choices,
        ai.answer,
        a.completed_at,
        a.score
    FROM public.attempt_items AS ai
    INNER JOIN public.attempts AS a
        ON ai.attempt_id = a.id
    WHERE a.completed_at >= now() - INTERVAL '180 days'
        AND a.completed_at IS NOT NULL
        AND ai.correct IS NOT NULL
),

question_stats AS (
    SELECT
        qb.id AS question_id,
        count(*) AS attempts,
        count(*) FILTER (WHERE ia.correct = true) AS correct_count,
        CASE
            WHEN count(*) > 0 THEN
                round(
                    (count(*) FILTER (WHERE ia.correct = true)::NUMERIC / count(*)::NUMERIC),
                    3
                )
            ELSE 0
        END AS p_correct,
        CASE
            WHEN count(*) > 0 THEN
                round(
                    avg(coalesce(ia.score, 0) / 100.0),
                    3
                )
            ELSE 0
        END AS avg_attempt_score,
        max(ia.completed_at) AS last_seen_at
    FROM public.question_bank AS qb
    LEFT JOIN item_attempts AS ia
        ON qb.stem = ia.stem
            AND qb.choices = ia.choices
            AND qb.answer = ia.answer
    GROUP BY qb.id
)

SELECT
    question_id,
    attempts,
    correct_count,
    p_correct,
    avg_attempt_score,
    last_seen_at
FROM question_stats;

-- Enable RLS on new tables
ALTER TABLE public.exam_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_blueprint_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_bank (admin only)
DROP POLICY IF EXISTS question_bank_admin_select ON public.question_bank;
CREATE POLICY question_bank_admin_select
    ON public.question_bank FOR SELECT
    USING (is_admin());

DROP POLICY IF EXISTS question_bank_admin_insert ON public.question_bank;
CREATE POLICY question_bank_admin_insert
    ON public.question_bank FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS question_bank_admin_update ON public.question_bank;
CREATE POLICY question_bank_admin_update
    ON public.question_bank FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS question_bank_admin_delete ON public.question_bank;
CREATE POLICY question_bank_admin_delete
    ON public.question_bank FOR DELETE
    USING (is_admin());

-- RLS Policies for exam_blueprints (admin only)
DROP POLICY IF EXISTS exam_blueprints_admin_select ON public.exam_blueprints;
CREATE POLICY exam_blueprints_admin_select
    ON public.exam_blueprints FOR SELECT
    USING (is_admin());

DROP POLICY IF EXISTS exam_blueprints_admin_insert ON public.exam_blueprints;
CREATE POLICY exam_blueprints_admin_insert
    ON public.exam_blueprints FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS exam_blueprints_admin_update ON public.exam_blueprints;
CREATE POLICY exam_blueprints_admin_update
    ON public.exam_blueprints FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS exam_blueprints_admin_delete ON public.exam_blueprints;
CREATE POLICY exam_blueprints_admin_delete
    ON public.exam_blueprints FOR DELETE
    USING (is_admin());

-- RLS Policies for exam_blueprint_rules (admin only)
DROP POLICY IF EXISTS exam_blueprint_rules_admin_select ON public.exam_blueprint_rules;
CREATE POLICY exam_blueprint_rules_admin_select
    ON public.exam_blueprint_rules FOR SELECT
    USING (is_admin());

DROP POLICY IF EXISTS exam_blueprint_rules_admin_insert ON public.exam_blueprint_rules;
CREATE POLICY exam_blueprint_rules_admin_insert
    ON public.exam_blueprint_rules FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS exam_blueprint_rules_admin_update ON public.exam_blueprint_rules;
CREATE POLICY exam_blueprint_rules_admin_update
    ON public.exam_blueprint_rules FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS exam_blueprint_rules_admin_delete ON public.exam_blueprint_rules;
CREATE POLICY exam_blueprint_rules_admin_delete
    ON public.exam_blueprint_rules FOR DELETE
    USING (is_admin());

-- Note: Views don't support RLS policies, so v_item_stats is accessible to all

-- Seed example blueprint for CA/DE-ONLINE course (inactive)
INSERT INTO public.exam_blueprints (course_id, name, total_questions, is_active)
SELECT
    c.id AS course_id,
    'Standard Final Exam' AS blueprint_name,
    25 AS total_questions,
    false AS is_active
FROM public.courses AS c
INNER JOIN public.jurisdictions AS j
    ON c.jurisdiction_id = j.id
WHERE j.code = 'CA'
    AND c.code = 'DE-ONLINE'
ON CONFLICT DO NOTHING;

-- Insert example rules for the blueprint
INSERT INTO public.exam_blueprint_rules (blueprint_id, rule_no, skill, count, min_difficulty, max_difficulty)
SELECT
    eb.id AS blueprint_id,
    1 AS rule_no,
    'Traffic Laws' AS skill,
    10 AS count,
    1 AS min_difficulty,
    5 AS max_difficulty
FROM public.exam_blueprints AS eb
INNER JOIN public.courses AS c
    ON eb.course_id = c.id
INNER JOIN public.jurisdictions AS j
    ON c.jurisdiction_id = j.id
WHERE j.code = 'CA'
    AND c.code = 'DE-ONLINE'
    AND eb.name = 'Standard Final Exam'
ON CONFLICT DO NOTHING;

INSERT INTO public.exam_blueprint_rules (blueprint_id, rule_no, skill, count, min_difficulty, max_difficulty)
SELECT
    eb.id AS blueprint_id,
    2 AS rule_no,
    'Road Signs' AS skill,
    8 AS count,
    1 AS min_difficulty,
    5 AS max_difficulty
FROM public.exam_blueprints AS eb
INNER JOIN public.courses AS c
    ON eb.course_id = c.id
INNER JOIN public.jurisdictions AS j
    ON c.jurisdiction_id = j.id
WHERE j.code = 'CA'
    AND c.code = 'DE-ONLINE'
    AND eb.name = 'Standard Final Exam'
ON CONFLICT DO NOTHING;

INSERT INTO public.exam_blueprint_rules (blueprint_id, rule_no, skill, count, min_difficulty, max_difficulty)
SELECT
    eb.id AS blueprint_id,
    3 AS rule_no,
    'Safe Driving' AS skill,
    7 AS count,
    1 AS min_difficulty,
    5 AS max_difficulty
FROM public.exam_blueprints AS eb
INNER JOIN public.courses AS c
    ON eb.course_id = c.id
INNER JOIN public.jurisdictions AS j
    ON c.jurisdiction_id = j.id
WHERE j.code = 'CA'
    AND c.code = 'DE-ONLINE'
    AND eb.name = 'Standard Final Exam'
ON CONFLICT DO NOTHING;
