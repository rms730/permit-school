-- 0005_guardian_features.sql
-- Guardian consent request & receipt functionality

-- Enum for guardian request status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'guardian_status') THEN
        CREATE TYPE public.guardian_status AS ENUM ('pending','verified','expired','canceled');
    END IF;
END$$;

-- Requests table: stores a hashed token, never the raw token
CREATE TABLE IF NOT EXISTS public.guardian_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    guardian_name text NOT NULL,
    guardian_email text NOT NULL,
    token_hash text NOT NULL, -- sha256 hex digest
    status public.guardian_status NOT NULL DEFAULT 'pending',
    expires_at timestamptz NOT NULL,
    verified_at timestamptz,
    verified_ip inet,
    verified_user_agent text,
    consent_id bigint REFERENCES public.consents(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS guardian_requests_student_idx
    ON public.guardian_requests (student_id, status, expires_at DESC);

CREATE INDEX IF NOT EXISTS guardian_requests_token_hash_idx
    ON public.guardian_requests (token_hash) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.guardian_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies: students see their own requests; admins see all; inserts limited to self or admin
CREATE POLICY guardian_requests_select_own
    ON public.guardian_requests FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY guardian_requests_insert_own
    ON public.guardian_requests FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY guardian_requests_admin_all
    ON public.guardian_requests FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Consents bucket for signed PDFs (separate from certificates)
INSERT INTO storage.buckets (id, name, public)
VALUES ('consents', 'consents', false)
ON CONFLICT (id) DO NOTHING;

-- Helpful view: latest guardian status per student/course
CREATE OR REPLACE VIEW public.v_guardian_latest AS
SELECT DISTINCT ON (gr.student_id, gr.course_id)
    gr.student_id,
    gr.course_id,
    gr.status,
    gr.expires_at,
    gr.verified_at,
    gr.consent_id
FROM public.guardian_requests AS gr
ORDER BY gr.student_id ASC, gr.course_id ASC, gr.created_at DESC;
