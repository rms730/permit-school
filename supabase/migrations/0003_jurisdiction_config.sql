-- 0003_jurisdiction_config.sql
-- Platformize for multi-state with DB-backed configuration

-- Jurisdiction-level runtime config
CREATE TABLE IF NOT EXISTS public.jurisdiction_configs (
    jurisdiction_id integer PRIMARY KEY REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
    final_exam_questions int NOT NULL DEFAULT 30,
    final_exam_pass_pct numeric NOT NULL CHECK (final_exam_pass_pct > 0 AND final_exam_pass_pct <= 1) DEFAULT 0.8,
    seat_time_required_minutes int NOT NULL DEFAULT 150,
    certificate_prefix text NOT NULL DEFAULT 'GEN',
    disclaimer text,
    support_email text,
    terms_url text,
    privacy_url text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pricing table (server-side lookup only)
CREATE TABLE IF NOT EXISTS public.billing_prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    stripe_price_id text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (course_id, stripe_price_id)
);

-- Certificate number sequence
CREATE SEQUENCE IF NOT EXISTS certificate_no_seq;

-- Certificate number function (prefix from config)
CREATE OR REPLACE FUNCTION public.make_certificate_number(j_code text)
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    prefix text;
BEGIN
    SELECT COALESCE(jc.certificate_prefix, j.code)
        INTO prefix
    FROM public.jurisdictions AS j
    LEFT JOIN public.jurisdiction_configs AS jc
        ON jc.jurisdiction_id = j.id
    WHERE j.code = j_code;

    RETURN format(
        '%s-%s-%06s',
        prefix,
        to_char(now(), 'yyyy'),
        nextval('certificate_no_seq')::text
    );
END;
$$;

-- Course catalog view
CREATE OR REPLACE VIEW public.v_course_catalog AS
WITH priced AS (
    SELECT
        c.id AS course_id,
        j.code AS j_code,
        c.code AS course_code,
        c.title AS course_title,
        exists(
            SELECT 1
            FROM public.billing_prices AS bp
            WHERE bp.course_id = c.id
                AND bp.active = true
        ) AS has_price
    FROM public.courses AS c
    INNER JOIN public.jurisdictions AS j
        ON c.jurisdiction_id = j.id
)

SELECT
    p.j_code,
    p.course_code,
    p.course_id,
    p.course_title,
    p.has_price
FROM priced AS p;

-- Create indexes
CREATE INDEX IF NOT EXISTS billing_prices_course_active_idx
    ON public.billing_prices (course_id, active);

-- Enable RLS
ALTER TABLE public.jurisdiction_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_prices ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY jurisdiction_configs_public_select
    ON public.jurisdiction_configs FOR SELECT
    USING (true);

CREATE POLICY jurisdiction_configs_admin_write
    ON public.jurisdiction_configs FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY billing_prices_admin_all
    ON public.billing_prices FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
