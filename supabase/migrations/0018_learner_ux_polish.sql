-- 0018_learner_ux_polish.sql
-- Learner Surfaces Polish (Modern UI Phase 2) + Quiz/Exam Player v2 + Seat-Time Integrity

-- Add profile fields for learner engagement and preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_tip timestamptz,
ADD COLUMN IF NOT EXISTS last_seen_celebration_at timestamptz,
ADD COLUMN IF NOT EXISTS allow_confetti boolean NOT NULL DEFAULT true;

-- Add indexes for engagement tracking queries
CREATE INDEX IF NOT EXISTS profiles_last_seen_tip_idx ON public.profiles(last_seen_tip);
CREATE INDEX IF NOT EXISTS profiles_last_seen_celebration_at_idx ON public.profiles(last_seen_celebration_at);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.last_seen_tip IS 'Timestamp of last tip shown to user';
COMMENT ON COLUMN public.profiles.last_seen_celebration_at IS 'Timestamp of last celebration shown to user';
COMMENT ON COLUMN public.profiles.allow_confetti IS 'User preference for confetti animations';
