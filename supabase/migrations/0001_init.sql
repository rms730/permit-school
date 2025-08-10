-- 0001_init.sql
-- Initial schema setup for multi-state driver-ed platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

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
    active boolean DEFAULT TRUE,
    UNIQUE (jurisdiction_id, code)
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
DO $plpgsql$ BEGIN
    CREATE TYPE attempt_mode AS ENUM ('quiz', 'mock', 'final');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $plpgsql$;

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
    is_generated boolean DEFAULT FALSE,
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
DO $plpgsql$ BEGIN
    CREATE TYPE cert_status AS ENUM ('ready', 'queued', 'mailed', 'void');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $plpgsql$;

CREATE TABLE IF NOT EXISTS public.certificate_serials (
    jurisdiction_id int NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
    serial text NOT NULL,
    used boolean DEFAULT FALSE,
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
DO $plpgsql$ BEGIN
    ALTER TABLE public.certificates
        ADD CONSTRAINT certificates_serial_fk
        FOREIGN KEY (jurisdiction_id, dl_serial)
        REFERENCES public.certificate_serials (jurisdiction_id, serial)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        DEFERRABLE INITIALLY IMMEDIATE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $plpgsql$;

-- Create indexes
CREATE INDEX IF NOT EXISTS content_chunks_embedding_idx
    ON public.content_chunks
    USING ivfflat (embedding vector_cosine_ops);

-- Enable RLS on all tables
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

-- Insert initial data
INSERT INTO public.jurisdictions (code, name, certificate_type)
VALUES ('CA', 'California', 'DL-400C')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.jurisdictions (code, name, certificate_type)
VALUES ('TX', 'Texas', NULL)
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
