-- 0021_ai_backend_foundation.sql
-- AI backend foundations:
-- - Proper RAG RPC signatures used by tooling
-- - FTS index + trigger for content_chunks.ts_doc
-- - Public read policies for handbook chunks + approved question bank
-- - Companion tokens (for external clients like ChatGPT Actions)
-- - AI tutor request logs (admin-only)

-- -------------------------------------------------------------------
-- content_chunks: maintain ts_doc for fast FTS and hybrid search
-- -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.content_chunks_set_ts_doc()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_cfg regconfig;
BEGIN
    v_cfg := CASE
        WHEN NEW.lang = 'es' THEN 'spanish'::regconfig
        ELSE 'english'::regconfig
    END;

    NEW.ts_doc := to_tsvector(v_cfg, coalesce(NEW.chunk, ''));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS content_chunks_set_ts_doc_trigger ON public.content_chunks;
CREATE TRIGGER content_chunks_set_ts_doc_trigger
    BEFORE INSERT OR UPDATE OF chunk, lang
    ON public.content_chunks
    FOR EACH ROW
    EXECUTE FUNCTION public.content_chunks_set_ts_doc();

-- Backfill existing rows (safe to rerun)
UPDATE public.content_chunks
SET ts_doc = to_tsvector(
    CASE WHEN lang = 'es' THEN 'spanish'::regconfig ELSE 'english'::regconfig END,
    coalesce(chunk, '')
)
WHERE ts_doc IS NULL;

CREATE INDEX IF NOT EXISTS content_chunks_ts_doc_idx
    ON public.content_chunks
    USING gin (ts_doc);

-- -------------------------------------------------------------------
-- RAG RPCs: add signatures matching our Node tools + application usage
-- -------------------------------------------------------------------

-- Vector-only match (distance is cosine distance; smaller is better)
CREATE OR REPLACE FUNCTION public.match_content_chunks(
    j_code text,
    q_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 5,
    lang text DEFAULT 'en',
    unit_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    jurisdiction_id int,
    section_ref text,
    lang text,
    source_url text,
    chunk text,
    distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id,
        cc.jurisdiction_id,
        cc.section_ref,
        cc.lang,
        cc.source_url,
        cc.chunk,
        (cc.embedding <=> q_embedding) AS distance
    FROM public.content_chunks AS cc
    JOIN public.jurisdictions AS j
        ON j.id = cc.jurisdiction_id
    WHERE
        j.code = j_code
        AND cc.embedding IS NOT NULL
        AND (lang IS NULL OR cc.lang = lang)
        AND (unit_id IS NULL OR EXISTS (
            SELECT 1
            FROM public.unit_chunks AS uc
            WHERE uc.unit_id = unit_id
                AND uc.chunk_id = cc.id
        ))
        AND 1 - (cc.embedding <=> q_embedding) > match_threshold
    ORDER BY cc.embedding <=> q_embedding
    LIMIT match_count;
END;
$$;

-- Hybrid match (vector + FTS). Falls back to vector-only if FTS yields no rows.
CREATE OR REPLACE FUNCTION public.match_content_chunks_hybrid(
    j_code text,
    query text,
    q_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 5,
    lang text DEFAULT 'en',
    unit_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    jurisdiction_id int,
    section_ref text,
    lang text,
    source_url text,
    chunk text,
    distance float,
    rank float,
    score float
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cfg regconfig;
    v_q tsquery;
BEGIN
    v_cfg := CASE
        WHEN lang = 'es' THEN 'spanish'::regconfig
        ELSE 'english'::regconfig
    END;

    v_q := plainto_tsquery(v_cfg, coalesce(query, ''));

    -- 1) Hybrid query (requires FTS match)
    RETURN QUERY
    WITH base AS (
        SELECT cc.*
        FROM public.content_chunks AS cc
        JOIN public.jurisdictions AS j
            ON j.id = cc.jurisdiction_id
        WHERE
            j.code = j_code
            AND cc.embedding IS NOT NULL
            AND (lang IS NULL OR cc.lang = lang)
            AND (unit_id IS NULL OR EXISTS (
                SELECT 1
                FROM public.unit_chunks AS uc
                WHERE uc.unit_id = unit_id
                    AND uc.chunk_id = cc.id
            ))
    ),
    scored AS (
        SELECT
            cc.id,
            cc.jurisdiction_id,
            cc.section_ref,
            cc.lang,
            cc.source_url,
            cc.chunk,
            (cc.embedding <=> q_embedding) AS distance,
            ts_rank(cc.ts_doc, v_q) AS rank,
            (1 - (cc.embedding <=> q_embedding)) * 0.7 + ts_rank(cc.ts_doc, v_q) * 0.3 AS score
        FROM base AS cc
        WHERE
            1 - (cc.embedding <=> q_embedding) > match_threshold
            AND cc.ts_doc @@ v_q
    )
    SELECT
        s.id,
        s.jurisdiction_id,
        s.section_ref,
        s.lang,
        s.source_url,
        s.chunk,
        s.distance,
        s.rank,
        s.score
    FROM scored AS s
    ORDER BY s.score DESC
    LIMIT match_count;

    -- 2) Vector fallback (no FTS match)
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            cc.id,
            cc.jurisdiction_id,
            cc.section_ref,
            cc.lang,
            cc.source_url,
            cc.chunk,
            (cc.embedding <=> q_embedding) AS distance,
            0::float AS rank,
            (1 - (cc.embedding <=> q_embedding)) AS score
        FROM public.content_chunks AS cc
        JOIN public.jurisdictions AS j
            ON j.id = cc.jurisdiction_id
        WHERE
            j.code = j_code
            AND cc.embedding IS NOT NULL
            AND (lang IS NULL OR cc.lang = lang)
            AND (unit_id IS NULL OR EXISTS (
                SELECT 1
                FROM public.unit_chunks AS uc
                WHERE uc.unit_id = unit_id
                    AND uc.chunk_id = cc.id
            ))
            AND 1 - (cc.embedding <=> q_embedding) > match_threshold
        ORDER BY cc.embedding <=> q_embedding
        LIMIT match_count;
    END IF;
END;
$$;

-- -------------------------------------------------------------------
-- RLS: make handbook chunks readable (public handbook content)
-- -------------------------------------------------------------------

DROP POLICY IF EXISTS content_chunks_public_read ON public.content_chunks;
CREATE POLICY content_chunks_public_read
    ON public.content_chunks
    FOR SELECT
    USING (true);

-- -------------------------------------------------------------------
-- Companion tokens: personal API keys for external clients
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.companion_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    label text,
    scopes text[] NOT NULL DEFAULT '{}'::text[],
    last_used_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS companion_tokens_user_id_idx
    ON public.companion_tokens (user_id);

CREATE INDEX IF NOT EXISTS companion_tokens_active_idx
    ON public.companion_tokens (user_id, revoked_at, last_used_at);

ALTER TABLE public.companion_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companion_tokens_select_own ON public.companion_tokens;
CREATE POLICY companion_tokens_select_own
    ON public.companion_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS companion_tokens_insert_own ON public.companion_tokens;
CREATE POLICY companion_tokens_insert_own
    ON public.companion_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS companion_tokens_update_own ON public.companion_tokens;
CREATE POLICY companion_tokens_update_own
    ON public.companion_tokens
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------------------
-- AI tutor logs: admin-only (PII-like freeform text)
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ai_tutor_logs (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    auth_kind text NOT NULL DEFAULT 'cookie',
    j_code text NOT NULL DEFAULT 'CA',
    lang text NOT NULL DEFAULT 'en',
    unit_id uuid REFERENCES public.course_units(id) ON DELETE SET NULL,
    query text NOT NULL,
    top_k int NOT NULL DEFAULT 5,
    answer text,
    citations jsonb NOT NULL DEFAULT '[]'::jsonb,
    model text,
    latency_ms int,
    error text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_tutor_logs_user_created_idx
    ON public.ai_tutor_logs (user_id, created_at DESC);

ALTER TABLE public.ai_tutor_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_tutor_logs_admin_only ON public.ai_tutor_logs;
CREATE POLICY ai_tutor_logs_admin_only
    ON public.ai_tutor_logs
    FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
