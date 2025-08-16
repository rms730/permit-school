-- 0012_auth_ui_foundation.sql
-- Google Sign-In + Teen-Friendly UX Refresh (Phase 1) + Mobile-First

-- Add new profile fields for Google auth and modern UI
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS preferred_name text,
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS ui_variant text NOT NULL DEFAULT 'classic' 
    CHECK (ui_variant IN ('classic','modern'));

-- Add indexes
CREATE INDEX IF NOT EXISTS profiles_ui_variant_idx ON public.profiles(ui_variant);
CREATE INDEX IF NOT EXISTS profiles_last_login_at_idx ON public.profiles(last_login_at);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.avatar_url IS 'Google OAuth avatar URL';
COMMENT ON COLUMN public.profiles.preferred_name IS 'User preferred display name';
COMMENT ON COLUMN public.profiles.last_login_at IS 'Timestamp of last login for analytics';
COMMENT ON COLUMN public.profiles.ui_variant IS 'UI theme variant: classic or modern';
