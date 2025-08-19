-- 0008_rls_policies.sql
-- RLS policies for new tables supporting both permit and college prep products

-- Programs: public read, admin write
CREATE POLICY "programs_public_read" ON public.programs
    FOR SELECT USING (true);

CREATE POLICY "programs_admin_write" ON public.programs
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Standardized tests: public read, admin write
CREATE POLICY "standardized_tests_public_read" ON public.standardized_tests
    FOR SELECT USING (true);

CREATE POLICY "standardized_tests_admin_write" ON public.standardized_tests
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Test sections: public read, admin write
CREATE POLICY "test_sections_public_read" ON public.test_sections
    FOR SELECT USING (true);

CREATE POLICY "test_sections_admin_write" ON public.test_sections
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Score scales: public read, admin write
CREATE POLICY "score_scales_public_read" ON public.score_scales
    FOR SELECT USING (true);

CREATE POLICY "score_scales_admin_write" ON public.score_scales
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Attempt sections: owner read/write, admin read
CREATE POLICY "attempt_sections_owner_read_write" ON public.attempt_sections
    FOR ALL USING (auth.uid() = (
        SELECT student_id FROM public.attempts WHERE id = attempt_id
    ));

CREATE POLICY "attempt_sections_admin_read" ON public.attempt_sections
    FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Outcomes: owner read, admin read/write
CREATE POLICY "outcomes_owner_read" ON public.outcomes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "outcomes_admin_all" ON public.outcomes
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Update existing policies to handle new schema

-- Courses: public read, admin write (updated for program support)
DROP POLICY IF EXISTS "courses_public_read" ON public.courses;
CREATE POLICY "courses_public_read" ON public.courses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "courses_admin_write" ON public.courses;
CREATE POLICY "courses_admin_write" ON public.courses
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Attempts: owner read/write, admin read (updated for test support)
DROP POLICY IF EXISTS "attempts_owner_read_write" ON public.attempts;
CREATE POLICY "attempts_owner_read_write" ON public.attempts
    FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "attempts_admin_read" ON public.attempts;
CREATE POLICY "attempts_admin_read" ON public.attempts
    FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Question bank: public read, admin write (updated for locale support)
DROP POLICY IF EXISTS "question_bank_public_read" ON public.question_bank;
CREATE POLICY "question_bank_public_read" ON public.question_bank
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "question_bank_admin_write" ON public.question_bank;
CREATE POLICY "question_bank_admin_write" ON public.question_bank
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
