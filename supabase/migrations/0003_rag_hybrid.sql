-- 0003_rag_hybrid.sql : hybrid retrieval (full-text + vector cosine)

-- Generated tsvector doc column, language-aware by `lang`
ALTER TABLE public.content_chunks
  ADD COLUMN IF NOT EXISTS ts_doc tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      CASE
        WHEN lang = 'en' THEN 'english'::regconfig
        WHEN lang = 'es' THEN 'spanish'::regconfig
        ELSE 'simple'::regconfig
      END,
      coalesce(chunk, '')
    )
  ) STORED;

-- Full-text index
CREATE INDEX IF NOT EXISTS content_chunks_ts_idx
  ON public.content_chunks USING gin (ts_doc);

-- Hybrid RPC: prefilter by FTS, then rank by cosine distance.
-- Note: We keep the signature using generic `vector` (not vector(1536)) so PostgREST sees it reliably.
CREATE OR REPLACE FUNCTION public.match_content_chunks_hybrid(
  j_code      text,
  query       text,
  q_embedding vector,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id           bigint,
  section_ref  text,
  chunk        text,
  source_url   text,
  distance     double precision,
  rank         double precision
)
LANGUAGE sql
STABLE
AS $$
  WITH pre AS (
    SELECT
      c.id,
      c.section_ref,
      c.chunk,
      c.source_url,
      c.embedding,
      ts_rank(c.ts_doc, plainto_tsquery('english', query)) AS rank
    FROM public.content_chunks AS c
    JOIN public.jurisdictions AS j ON j.id = c.jurisdiction_id
    WHERE upper(j.code) = upper(j_code)
      AND c.lang = 'en'  -- keep results English for now
      AND c.ts_doc @@ plainto_tsquery('english', query)
    ORDER BY rank DESC
    LIMIT 200
  )
  SELECT
    p.id,
    p.section_ref,
    p.chunk,
    p.source_url,
    p.embedding <=> q_embedding AS distance,
    p.rank
  FROM pre AS p
  ORDER BY p.embedding <=> q_embedding
  LIMIT match_count
$$;

REVOKE ALL ON FUNCTION public.match_content_chunks_hybrid(text, text, vector, int) FROM public;
GRANT EXECUTE ON FUNCTION public.match_content_chunks_hybrid(text, text, vector, int)
  TO anon, authenticated, service_role;

-- Ask PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';
