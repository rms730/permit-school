-- Baseline migration for permit-school
-- Creates all core tables, indexes, and constraints

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS audit_logs_id_seq;
CREATE SEQUENCE IF NOT EXISTS billing_events_id_seq;
CREATE SEQUENCE IF NOT EXISTS cert_stock_id_seq;
CREATE SEQUENCE IF NOT EXISTS consents_id_seq;
CREATE SEQUENCE IF NOT EXISTS content_chunks_id_seq;
CREATE SEQUENCE IF NOT EXISTS data_exports_id_seq;
CREATE SEQUENCE IF NOT EXISTS deletion_requests_id_seq;
CREATE SEQUENCE IF NOT EXISTS jurisdictions_id_seq;
CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;
CREATE SEQUENCE IF NOT EXISTS regulatory_artifacts_id_seq;
CREATE SEQUENCE IF NOT EXISTS seat_time_events_id_seq;
CREATE SEQUENCE IF NOT EXISTS tutor_logs_id_seq;

-- Core tables
CREATE TABLE IF NOT EXISTS public.jurisdictions (
    id integer NOT NULL DEFAULT nextval(jurisdictions_id_seq::regclass),
    code text NOT NULL,
    name text NOT NULL,
    certificate_type text,
    metadata jsonb DEFAULT {}::jsonb,
    CONSTRAINT jurisdictions_pkey PRIMARY KEY (id),
    CONSTRAINT jurisdictions_code_key UNIQUE (code),
    CONSTRAINT jurisdictions_code_check CHECK (char_length(code) = 2)
);

CREATE TABLE IF NOT EXISTS public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    jurisdiction_id integer NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    price_cents integer NOT NULL DEFAULT 999,
    hours_required_minutes integer,
    active boolean DEFAULT true,
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_jurisdiction_id_fkey FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id)
);

CREATE TABLE IF NOT EXISTS public.course_units (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    unit_no integer NOT NULL,
    title text NOT NULL,
    minutes_required integer NOT NULL,
    objectives text,
    is_published boolean NOT NULL DEFAULT false,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_units_pkey PRIMARY KEY (id),
    CONSTRAINT course_units_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT course_units_minutes_required_check CHECK (minutes_required >= 5 AND minutes_required <= 240),
    CONSTRAINT course_units_unit_no_check CHECK (unit_no > 0)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS course_units_course_id_idx ON public.course_units USING btree (course_id);

COMMIT;
