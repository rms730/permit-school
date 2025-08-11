-- 0004_tutor_logs.sql
-- Minimal logging for tutor calls

CREATE TABLE IF NOT EXISTS public.tutor_logs (
    id bigserial PRIMARY KEY,
    user_id uuid,                       -- nullable until auth lands
    j_code text NOT NULL CHECK (char_length(j_code) = 2),
    query text NOT NULL,
    top_k int NOT NULL CHECK (top_k BETWEEN 1 AND 50),
    latency_ms int NOT NULL CHECK (latency_ms >= 0),
    model text,                         -- e.g., 'gpt-4o-mini'
    error text,                         -- null on success
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tutor_logs ENABLE ROW LEVEL SECURITY;

-- Admins may read logs
DO $plpgsql$ BEGIN
    CREATE POLICY "tutor_logs_admin_read"
        ON public.tutor_logs
        FOR SELECT
        USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $plpgsql$;

-- Inserts will be performed by server with the service role, which bypasses RLS.
-- No insert/update/delete policies required at this time.

-- Helpful index for recency and filtering
CREATE INDEX IF NOT EXISTS tutor_logs_created_at_idx ON public.tutor_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS tutor_logs_j_code_idx ON public.tutor_logs (j_code);
