-- 0015_handbook_sources.sql
-- DMV handbook sources (private storage + admin-only table)

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('handbooks', 'handbooks', false)
ON CONFLICT (id) DO NOTHING;

-- Table to track uploaded artifacts
CREATE TABLE IF NOT EXISTS public.handbook_sources (
    id text PRIMARY KEY,                           -- e.g., 'dl-600-en-2025'
    lang text NOT NULL CHECK (lang IN ('en','es')),
    title text NOT NULL,
    edition text,                                  -- DL 600
    revision text,                                 -- 'R6/2025'
    source_url text,
    license text,
    storage_path text,                             -- storage path after upload
    filename text NOT NULL,
    bytes bigint CHECK (bytes >= 0),
    sha256 text NOT NULL,
    pages int,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.handbook_sources ENABLE ROW LEVEL SECURITY;

-- Admin-only full access
DROP POLICY IF EXISTS handbook_sources_admin_all ON public.handbook_sources;
CREATE POLICY handbook_sources_admin_all
    ON public.handbook_sources
    FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
