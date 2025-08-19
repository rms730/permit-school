-- 0009_guardian_portal.sql
-- Guardian Portal & In-App Notifications

-- Enums for notification types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE public.notification_type AS ENUM (
            'seat_time_milestone',
            'quiz_completed',
            'final_passed',
            'subscription_activated',
            'certificate_issued',
            'guardian_consent_verified',
            'weekly_digest'
        );
    END IF;
END$$;

-- Extend notifications table with type and data columns
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS type public.notification_type,
ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_created_idx
    ON public.notifications (user_id, created_at DESC);

-- Guardian reporting views (read-only, RLS respected via underlying tables)
CREATE OR REPLACE VIEW public.v_guardian_children AS
SELECT
    gl.guardian_id,
    sp.user_id AS student_id,
    sp.first_name,
    sp.last_name,
    sp.dob,
    p.role AS student_role
FROM public.guardian_links AS gl
INNER JOIN public.student_profiles AS sp
    ON gl.student_id = sp.user_id
INNER JOIN public.profiles AS p
    ON sp.user_id = p.id;

-- Course progress summary per student (reuses existing tables)
CREATE OR REPLACE VIEW public.v_guardian_student_course AS
SELECT
    gl.guardian_id,
    ste.student_id,
    ste.course_id,
    j.code AS j_code,
    c.code AS course_code,
    c.title AS course_title,
    COALESCE(COUNT(ste.id), 0) AS events_total,
    COALESCE(MAX(a.score) FILTER (WHERE a.mode = 'final'), NULL) AS final_exam_score,
    COALESCE(MAX(a.completed_at) FILTER (WHERE a.mode = 'final'), NULL) AS final_exam_completed,
    EXISTS(
        SELECT 1
        FROM public.certificates AS cert
        WHERE cert.student_id = ste.student_id
            AND cert.course_id = ste.course_id
            AND cert.status = 'ready'
    ) AS has_certificate
FROM public.guardian_links AS gl
INNER JOIN public.seat_time_events AS ste
    ON gl.student_id = ste.student_id
INNER JOIN public.courses AS c
    ON ste.course_id = c.id
INNER JOIN public.jurisdictions AS j
    ON c.jurisdiction_id = j.id
LEFT JOIN public.attempts AS a
    ON ste.student_id = a.student_id
    AND ste.course_id = a.course_id
GROUP BY gl.guardian_id, ste.student_id, ste.course_id, j.code, c.code, c.title;

-- RLS policies for notifications
CREATE POLICY notifications_owner_select
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY notifications_owner_update
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY notifications_admin_read
    ON public.notifications FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
