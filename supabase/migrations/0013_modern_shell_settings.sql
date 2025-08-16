-- 0013_modern_shell_settings.sql
-- Full Modern Rollout (Phase 3) - Settings, Account, Nav Shell, Avatars, Google One-Tap

-- Extend profiles table with theme preferences and marketing opt-in
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme_pref text NOT NULL DEFAULT 'system' 
    CHECK (theme_pref IN ('system','light','dark')),
ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;

-- Add indexes
CREATE INDEX IF NOT EXISTS profiles_theme_pref_idx ON public.profiles(theme_pref);
CREATE INDEX IF NOT EXISTS profiles_marketing_opt_in_idx ON public.profiles(marketing_opt_in);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.theme_pref IS 'User theme preference: system, light, or dark';
COMMENT ON COLUMN public.profiles.marketing_opt_in IS 'User consent for marketing communications';

-- Create storage bucket for avatars (private by default)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars','avatars', false) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for avatars bucket (robust version)
-- Owner write policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars-owner-write'
    ) THEN
        CREATE POLICY "avatars-owner-write"
            ON storage.objects
            FOR ALL
            TO authenticated
            USING (
                bucket_id = 'avatars'
                AND (storage.foldername(name))[1] = safe_auth_uid()::text
            )
            WITH CHECK (
                bucket_id = 'avatars'
                AND (storage.foldername(name))[1] = safe_auth_uid()::text
            );
    END IF;
END$$;

-- Owner read (signed URLs bypass RLS, but allow owner/admin anyway)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars-owner-read'
    ) THEN
        CREATE POLICY "avatars-owner-read"
            ON storage.objects
            FOR SELECT
            TO authenticated
            USING (
                bucket_id = 'avatars'
                AND (
                    (storage.foldername(name))[1] = safe_auth_uid()::text
                    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                )
            );
    END IF;
END$$;
