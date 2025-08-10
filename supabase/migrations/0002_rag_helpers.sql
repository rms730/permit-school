-- 0002_rag_helpers.sql : RPCs for retrieval-augmented tutoring

-- Match content chunks by ANN search. Lower distance = closer.
CREATE OR REPLACE FUNCTION public.match_content_chunks(
  j_code        text,
  q_embedding   vector(1536),
  match_count   int DEFAULT 5
)
RETURNS TABLE (
  id           bigint,
  section_ref  text,
  chunk        text,
  source_url   text,
  distance     double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.section_ref,
    c.chunk,
    c.source_url,
    c.embedding <-> q_embedding AS distance
  FROM public.content_chunks AS c
  JOIN public.jurisdictions AS j ON j.id = c.jurisdiction_id
  WHERE upper(j.code) = upper(j_code)
  ORDER BY c.embedding <-> q_embedding
  LIMIT match_count
$$;

-- Let normal clients call the RPC (RLS still applies to SELECTs)
REVOKE ALL ON FUNCTION public.match_content_chunks(text, vector(1536), int) FROM public;
GRANT EXECUTE ON FUNCTION public.match_content_chunks(text, vector(1536), int) TO anon, authenticated, service_role;
