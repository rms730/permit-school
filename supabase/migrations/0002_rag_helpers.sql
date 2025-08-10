-- 0002_rag_helpers.sql
-- RAG helper functions for content search

-- Function to match content chunks using vector similarity
CREATE OR REPLACE FUNCTION match_content_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 5,
    filter_jurisdiction text DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    jurisdiction_id int,
    section_ref text,
    lang text,
    source_url text,
    chunk text,
    similarity float
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
        1 - (cc.embedding <=> query_embedding) AS similarity
    FROM public.content_chunks cc
    WHERE 1 - (cc.embedding <=> query_embedding) > match_threshold
        AND (filter_jurisdiction IS NULL OR 
             EXISTS (
                 SELECT 1 FROM public.jurisdictions j 
                 WHERE j.id = cc.jurisdiction_id AND j.code = filter_jurisdiction
             ))
    ORDER BY cc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
