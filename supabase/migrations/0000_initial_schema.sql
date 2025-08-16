-- 0000_initial_schema.sql
-- Initial schema setup for multi-state driver-ed platform
-- This migration creates all core tables, indexes, and initial data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attempt_mode') THEN
        CREATE TYPE attempt_mode AS ENUM ('quiz', 'mock', 'final');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cert_status') THEN
        CREATE TYPE cert_status AS ENUM ('ready', 'queued', 'mailed', 'void');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_status') THEN
        CREATE TYPE export_status AS ENUM ('pending', 'ready', 'error');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deletion_status') THEN
        CREATE TYPE deletion_status AS ENUM ('pending', 'confirmed', 'executed', 'canceled');
    END IF;
END$$;

-- Jurisdictions (e.g., CA, TX)
CREATE TABLE IF NOT EXISTS public.jurisdictions (
    id serial PRIMARY KEY,
    code text UNIQUE NOT NULL CHECK (char_length(code) = 2), -- 'CA', 'TX'
    name text NOT NULL,
    certificate_type text,        -- e.g., 'DL-400C' (CA), others for TX
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Courses (per jurisdiction)
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jurisdiction_id int NOT NULL REFERENCES public.jurisdictions(id) ON DELETE RESTRICT,
    code text NOT NULL,         -- e.g., 'DE-ONLINE'
    title text NOT NULL,
    price_cents int NOT NULL DEFAULT 999,
    hours_required_minutes int, -- e.g., CA equivalency 30*50=1500
    active boolean DEFAULT true,
    UNIQUE (jurisdiction_id, code)
);

-- Course units
CREATE TABLE IF NOT EXISTS public.course_units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    unit_no integer NOT NULL,
    title text NOT NULL,
    minutes_required integer NOT NULL,
    objectives text,
    is_published boolean NOT NULL DEFAULT false,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_units_minutes_required_check CHECK (minutes_required >= 5 AND minutes_required <= 240),
    CONSTRAINT course_units_unit_no_check CHECK (unit_no > 0)
);

-- Profiles (auth.users is managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('student', 'guardian', 'admin')),
    full_name text,
    locale text DEFAULT 'en',
    created_at timestamptz DEFAULT now()
);

-- Guardian links (many-to-many)
CREATE TABLE IF NOT EXISTS public.guardian_links (
    guardian_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (guardian_id, student_id)
);

-- Unit progress + seat time
CREATE TABLE IF NOT EXISTS public.unit_progress (
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    unit_id int NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    time_ms bigint DEFAULT 0 CHECK (time_ms >= 0),
    mastery numeric DEFAULT 0 CHECK (mastery BETWEEN 0 AND 1),
    PRIMARY KEY (student_id, course_id, unit_id)
);

-- Attempts (quiz/mock/final) + items
CREATE TABLE IF NOT EXISTS public.attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    mode attempt_mode NOT NULL,
    score numeric,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.attempt_items (
    attempt_id uuid NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    item_no smallint NOT NULL,
    skill text NOT NULL,
    stem text NOT NULL,
    choices jsonb NOT NULL,              -- {A:...,B:...,C:...,D:...}
    answer text NOT NULL,                -- "A".."D"
    explanation text,
    correct boolean,
    source_sections text[] DEFAULT '{}'::text[],
    PRIMARY KEY (attempt_id, item_no)
);

-- Mastery (EWMA)
CREATE TABLE IF NOT EXISTS public.skill_mastery (
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    skill text NOT NULL,
    mastery numeric NOT NULL CHECK (mastery BETWEEN 0 AND 1),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (student_id, course_id, skill)
);

-- Question bank
CREATE TABLE IF NOT EXISTS public.question_bank (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    skill text NOT NULL,
    difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    stem text NOT NULL,
    choices jsonb NOT NULL,
    answer text NOT NULL,
    explanation text NOT NULL,
    source_sections text[] NOT NULL,
    is_generated boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- RAG corpus
CREATE TABLE IF NOT EXISTS public.content_chunks (
    id bigserial PRIMARY KEY,
    jurisdiction_id int NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
    section_ref text,
    lang text NOT NULL CHECK (lang IN ('en', 'es')),
    source_url text,
    chunk text NOT NULL,
    embedding vector(1536),  -- text-embedding-3-small (indexable with IVFFlat/HNSW)
    ts_doc tsvector
);

-- Certificates + serials
CREATE TABLE IF NOT EXISTS public.certificate_serials (
    jurisdiction_id int NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
    serial text NOT NULL,
    used boolean DEFAULT false,
    assigned_to uuid REFERENCES auth.users(id),
    assigned_at timestamptz,
    PRIMARY KEY (jurisdiction_id, serial)
);

CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    jurisdiction_id int NOT NULL REFERENCES public.jurisdictions(id) ON DELETE RESTRICT,
    dl_serial text,                          -- referenced via composite FK below
    status cert_status NOT NULL DEFAULT 'ready',
    ship_to jsonb NOT NULL,                  -- {name,address1,city,state,zip}
    passed_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Ensure composite FK exists
ALTER TABLE public.certificates
    ADD CONSTRAINT certificates_serial_fk
    FOREIGN KEY (jurisdiction_id, dl_serial)
    REFERENCES public.certificate_serials (jurisdiction_id, serial)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    DEFERRABLE INITIALLY IMMEDIATE;

-- Billing tables
CREATE TABLE IF NOT EXISTS public.billing_customers (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id text NOT NULL UNIQUE,
    status text NOT NULL CHECK (
        status IN (
            'trialing','active','past_due','canceled','incomplete','incomplete_expired','unpaid','paused'
        )
    ),
    current_period_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entitlements (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    j_code text NOT NULL DEFAULT 'CA',
    active boolean NOT NULL DEFAULT false,
    source text NOT NULL DEFAULT 'stripe',
    expires_at timestamptz,
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, j_code)
);

CREATE TABLE IF NOT EXISTS public.billing_events (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    amount_cents integer NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    status text NOT NULL DEFAULT 'pending',
    stripe_event_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Tutor logs
CREATE TABLE IF NOT EXISTS public.tutor_logs (
    id bigserial PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    unit_id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    context_chunks text[] DEFAULT '{}'::text[],
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Seat time tracking
CREATE TABLE IF NOT EXISTS public.seat_time_events (
    id bigserial PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    unit_id integer NOT NULL,
    event_type text NOT NULL, -- 'start', 'pause', 'resume', 'complete'
    timestamp timestamptz NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Consent tracking
CREATE TABLE IF NOT EXISTS public.consents (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type text NOT NULL,
    granted boolean NOT NULL,
    granted_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz,
    ip_address inet,
    user_agent text
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Regulatory artifacts
CREATE TABLE IF NOT EXISTS public.regulatory_artifacts (
    id bigserial PRIMARY KEY,
    jurisdiction_id int NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
    artifact_type text NOT NULL,
    filename text NOT NULL,
    file_size bigint NOT NULL,
    checksum text NOT NULL,
    uploaded_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Data exports for DSAR
CREATE TABLE IF NOT EXISTS public.data_exports (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status export_status NOT NULL DEFAULT 'pending',
    bundle_path text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    error text,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- Deletion requests for DSAR
CREATE TABLE IF NOT EXISTS public.deletion_requests (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status deletion_status NOT NULL DEFAULT 'pending',
    requested_at timestamptz NOT NULL DEFAULT now(),
    confirmed_at timestamptz,
    executed_at timestamptz,
    reason text,
    confirmation_token text UNIQUE,
    token_expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- Audit logs for tamper-evident audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id bigserial PRIMARY KEY,
    actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role text NOT NULL,
    action text NOT NULL,
    object_table text NOT NULL,
    object_id text,
    before jsonb,
    after jsonb,
    ip inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now(),
    signature text NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS course_units_course_id_idx ON public.course_units USING btree (course_id);
CREATE INDEX IF NOT EXISTS content_chunks_embedding_idx 
    ON public.content_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS entitlements_active_idx ON public.entitlements(active, expires_at);
CREATE INDEX IF NOT EXISTS billing_events_user_id_idx ON public.billing_events USING btree (user_id);
CREATE INDEX IF NOT EXISTS tutor_logs_student_course_idx ON public.tutor_logs USING btree (student_id, course_id);
CREATE INDEX IF NOT EXISTS seat_time_events_student_course_idx 
    ON public.seat_time_events USING btree (student_id, course_id);
CREATE INDEX IF NOT EXISTS consents_user_id_idx ON public.consents USING btree (user_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications USING btree (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_actor_user_id_idx ON public.audit_logs USING btree (actor_user_id);

-- Enable RLS on all tables
ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_time_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Insert initial data
INSERT INTO public.jurisdictions (code, name, certificate_type)
VALUES ('CA', 'California', 'DL-400C')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.jurisdictions (code, name, certificate_type)
VALUES ('TX', 'Texas', null)
ON CONFLICT (code) DO NOTHING;

-- Link default course for CA
INSERT INTO public.courses (jurisdiction_id, code, title, price_cents, hours_required_minutes)
SELECT
    j.id AS jurisdiction_id,
    'DE-ONLINE' AS code,
    'Online Driver Education' AS title,
    999 AS price_cents,
    1500 AS hours_required_minutes
FROM public.jurisdictions AS j
WHERE j.code = 'CA'
ON CONFLICT DO NOTHING;

-- Create billing views
CREATE OR REPLACE VIEW public.v_user_entitlements AS
SELECT
    e.user_id,
    e.j_code,
    (
        e.active
        AND (e.expires_at IS null OR e.expires_at > now())
    ) AS active
FROM public.entitlements AS e;
