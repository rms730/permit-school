-- 0004_profiles_enrollment.sql
-- Student profiles and enrollment management

-- Student profiles: one row per user (PII)
CREATE TABLE IF NOT EXISTS public.student_profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    middle_name text,
    dob date NOT NULL,
    phone text,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL DEFAULT 'CA',
    postal_code text NOT NULL,
    guardian_name text,
    guardian_email text,
    guardian_phone text,
    terms_accepted_at timestamptz,
    privacy_accepted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Touch updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_profiles_touch ON public.student_profiles;
CREATE TRIGGER trg_student_profiles_touch
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();

-- Enrollments: user ↔ course (one active per course)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
        CREATE TYPE public.enrollment_status AS ENUM ('active','canceled','completed');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status public.enrollment_status NOT NULL DEFAULT 'active',
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    UNIQUE (student_id, course_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS enrollments_student_course_idx
    ON public.enrollments (student_id, course_id);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for student profiles
CREATE POLICY student_profiles_select_own
    ON public.student_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY student_profiles_upsert_own
    ON public.student_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY student_profiles_update_own
    ON public.student_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY student_profiles_admin_read
    ON public.student_profiles FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RLS policies for enrollments
CREATE POLICY enrollments_select_own
    ON public.enrollments FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY enrollments_upsert_own
    ON public.enrollments FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY enrollments_update_own
    ON public.enrollments FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY enrollments_admin_read
    ON public.enrollments FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
