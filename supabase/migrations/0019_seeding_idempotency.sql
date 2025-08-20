-- 0019_seeding_idempotency.sql
-- Ensure unique references for idempotent seeding

-- Ensure unique references for content chunks
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_chunks_unique_ref
  ON public.content_chunks (jurisdiction_id, lang, section_ref);

-- Ensure unique source references for question bank
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_bank_source_ref
  ON public.question_bank (course_id, source_ref)
  WHERE source_ref IS NOT NULL;
