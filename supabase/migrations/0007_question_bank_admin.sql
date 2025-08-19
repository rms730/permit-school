-- 0007_question_bank_admin.sql
-- Question Bank Authoring, Exam Blueprinting & Item Analytics

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

-- Create exam_blueprints table
CREATE TABLE IF NOT EXISTS public.exam_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_questions INT NOT NULL CHECK (total_questions > 0),
    test_id uuid REFERENCES public.standardized_tests(id) ON DELETE SET NULL,
    time_limit_sec int CHECK (time_limit_sec IS NULL OR time_limit_sec > 0),
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
    section_id uuid REFERENCES public.test_sections(id) ON DELETE SET NULL,
    tags_any text[] DEFAULT NULL,
    PRIMARY KEY (blueprint_id, rule_no)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS question_bank_course_status_idx
    ON public.question_bank (course_id, status);

CREATE INDEX IF NOT EXISTS question_bank_tags_gin_idx
    ON public.question_bank USING gin (tags);

CREATE INDEX IF NOT EXISTS question_bank_search_idx
    ON public.question_bank USING gin (to_tsvector('english', coalesce(stem, '') || ' ' || coalesce(explanation, '')));

-- Helpful partial index for sectioned selection
CREATE INDEX IF NOT EXISTS idx_qb_course_skill_diff_tags
    ON public.question_bank (course_id, skill, difficulty, tags);

-- Create unique constraint for one active blueprint per course
CREATE UNIQUE INDEX IF NOT EXISTS exam_blueprints_one_active_per_course_idx
    ON public.exam_blueprints (course_id)
    WHERE is_active = true;

-- Add updated_at trigger to question_bank
DROP TRIGGER IF EXISTS question_bank_updated_at_trigger ON public.question_bank;
CREATE TRIGGER question_bank_updated_at_trigger
    BEFORE UPDATE ON public.question_bank
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- Add updated_at trigger to exam_blueprints
DROP TRIGGER IF EXISTS exam_blueprints_updated_at_trigger ON public.exam_blueprints;
CREATE TRIGGER exam_blueprints_updated_at_trigger
    BEFORE UPDATE ON public.exam_blueprints
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS on new tables
ALTER TABLE public.exam_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_blueprint_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for exam blueprints
CREATE POLICY exam_blueprints_select_all
    ON public.exam_blueprints FOR SELECT
    USING (true);

CREATE POLICY exam_blueprints_admin_all
    ON public.exam_blueprints FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RLS policies for exam blueprint rules
CREATE POLICY exam_blueprint_rules_select_all
    ON public.exam_blueprint_rules FOR SELECT
    USING (true);

CREATE POLICY exam_blueprint_rules_admin_all
    ON public.exam_blueprint_rules FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
