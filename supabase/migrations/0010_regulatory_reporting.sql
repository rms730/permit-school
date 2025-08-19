-- 0010_regulatory_reporting.sql
-- Regulatory reporting and DMV submission toolkit (CA-first, multi-state ready)

-- Regulatory runs table
CREATE TABLE IF NOT EXISTS public.regulatory_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    j_code text NOT NULL CHECK (char_length(j_code) = 2),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    period_start date NOT NULL,
    period_end date NOT NULL,
    status text NOT NULL CHECK (status IN ('pending','running','succeeded','failed','canceled')) DEFAULT 'pending',
    started_at timestamptz,
    finished_at timestamptz,
    summary jsonb DEFAULT '{}'::jsonb,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Ensure period is valid
    CONSTRAINT regulatory_runs_period_check
        CHECK (period_start <= period_end)
);

-- Regulatory artifacts table (already exists in initial schema)
-- Note: The existing regulatory_artifacts table has a different structure
-- This migration focuses on regulatory_runs for now

-- Create storage bucket for DMV reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('dmv_reports', 'dmv_reports', false)
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS regulatory_runs_jurisdiction_course_period_idx
    ON public.regulatory_runs (j_code, course_id, period_start, period_end, status);

CREATE INDEX IF NOT EXISTS regulatory_runs_created_at_idx
    ON public.regulatory_runs (created_at DESC);

-- Index removed - regulatory_artifacts table has different structure

-- Supporting indexes for time-range queries
CREATE INDEX IF NOT EXISTS attempts_completed_at_idx
    ON public.attempts (completed_at)
    WHERE completed_at IS NOT null;

CREATE INDEX IF NOT EXISTS certificates_passed_at_idx
    ON public.certificates (passed_at)
    WHERE passed_at IS NOT null;

CREATE INDEX IF NOT EXISTS seat_time_events_timestamp_idx
    ON public.seat_time_events (timestamp);

-- Enable RLS
ALTER TABLE public.regulatory_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_artifacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for regulatory_runs (admin only)
CREATE POLICY regulatory_runs_admin_all
    ON public.regulatory_runs FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RLS policies for regulatory_artifacts (admin only)
-- Note: Using existing regulatory_artifacts table structure
CREATE POLICY regulatory_artifacts_admin_all
    ON public.regulatory_artifacts FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Touch updated_at trigger
DROP TRIGGER IF EXISTS trg_regulatory_runs_touch ON public.regulatory_runs;
CREATE TRIGGER trg_regulatory_runs_touch
    BEFORE UPDATE ON public.regulatory_runs
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
