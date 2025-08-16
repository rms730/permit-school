-- 0001_rag_functions.sql
-- RAG helper functions for content search and hybrid search

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

-- Function to match content chunks using hybrid search (vector + FTS)
CREATE OR REPLACE FUNCTION match_content_chunks_hybrid(
    query_embedding vector(1536),
    query_text text,
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
    similarity float,
    rank float
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
        1 - (cc.embedding <=> query_embedding) AS similarity,
        ts_rank(to_tsvector('english', cc.chunk), plainto_tsquery('english', query_text)) AS rank
    FROM public.content_chunks cc
    WHERE 1 - (cc.embedding <=> query_embedding) > match_threshold
        AND to_tsvector('english', cc.chunk) @@ plainto_tsquery('english', query_text)
        AND (filter_jurisdiction IS NULL OR 
             EXISTS (
                 SELECT 1 FROM public.jurisdictions j 
                 WHERE j.id = cc.jurisdiction_id AND j.code = filter_jurisdiction
             ))
    ORDER BY (1 - (cc.embedding <=> query_embedding)) * 0.7 + 
             ts_rank(to_tsvector('english', cc.chunk), plainto_tsquery('english', query_text)) * 0.3 DESC
    LIMIT match_count;
END;
$$;
