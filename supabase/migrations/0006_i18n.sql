-- 0006_i18n.sql
-- Internationalization: question translations + locale support

-- Add locale column to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'es'));

-- Question translations table
CREATE TABLE IF NOT EXISTS public.question_translations (
    question_id uuid NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    lang text NOT NULL CHECK (lang IN ('en', 'es')),
    stem text NOT NULL,
    choices jsonb NOT NULL,
    explanation text,
    PRIMARY KEY (question_id, lang)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS question_translations_q_lang_idx
    ON public.question_translations (question_id, lang);

-- Enable RLS
ALTER TABLE public.question_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY question_translations_select_all
    ON public.question_translations FOR SELECT
    USING (true);

CREATE POLICY question_translations_admin_all
    ON public.question_translations FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Helper view for convenience in API
CREATE OR REPLACE VIEW public.v_question_text AS
SELECT
    qb.id AS question_id,
    COALESCE(qt.lang, 'en') AS lang,
    COALESCE(qt.stem, qb.stem) AS stem,
    COALESCE(qt.choices, qb.choices) AS choices,
    COALESCE(qt.explanation, qb.explanation) AS explanation
FROM public.question_bank AS qb
LEFT JOIN public.question_translations AS qt
    ON qb.id = qt.question_id;
