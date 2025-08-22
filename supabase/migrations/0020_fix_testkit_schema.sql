-- 0020_fix_testkit_schema.sql
-- Fix missing columns that are causing test failures

-- Add missing enrolled_at column to enrollments table
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Add missing rule_order column to exam_blueprint_rules table
ALTER TABLE public.exam_blueprint_rules 
ADD COLUMN IF NOT EXISTS rule_order SMALLINT;

-- Update existing records to have rule_order = rule_no
UPDATE public.exam_blueprint_rules 
SET rule_order = rule_no 
WHERE rule_order IS NULL;

-- Make rule_order NOT NULL after updating existing records
ALTER TABLE public.exam_blueprint_rules 
ALTER COLUMN rule_order SET NOT NULL;

-- Also ensure rule_no is not null for new records
ALTER TABLE public.exam_blueprint_rules 
ALTER COLUMN rule_no SET NOT NULL;

-- Add index for rule_order
CREATE INDEX IF NOT EXISTS exam_blueprint_rules_order_idx 
ON public.exam_blueprint_rules (blueprint_id, rule_order);

-- Add user_id column as alias for student_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'user_id') THEN
        ALTER TABLE public.enrollments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update user_id to match student_id
        UPDATE public.enrollments SET user_id = student_id WHERE user_id IS NULL;
        -- Make user_id NOT NULL
        ALTER TABLE public.enrollments ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;
