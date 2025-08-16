-- 0016_jurisdiction_config_extensions.sql
-- Extend jurisdiction_configs table with additional jurisdiction-specific settings

-- Add new columns to jurisdiction_configs table
ALTER TABLE public.jurisdiction_configs 
ADD COLUMN IF NOT EXISTS certificate_issuer_name text,
ADD COLUMN IF NOT EXISTS certificate_issuer_license text,
ADD COLUMN IF NOT EXISTS support_phone text,
ADD COLUMN IF NOT EXISTS regulatory_signing_secret text,
ADD COLUMN IF NOT EXISTS fulfillment_low_stock_threshold integer DEFAULT 200;

-- Add comments for documentation
COMMENT ON COLUMN public.jurisdiction_configs.certificate_issuer_name IS 'Name of the certificate issuing organization (e.g., "Acme Driving Academy")';
COMMENT ON COLUMN public.jurisdiction_configs.certificate_issuer_license IS 'License number of the certificate issuing organization (e.g., "CA-INS-000123")';
COMMENT ON COLUMN public.jurisdiction_configs.support_phone IS 'Support phone number for this jurisdiction';
COMMENT ON COLUMN public.jurisdiction_configs.regulatory_signing_secret IS 'Secret key for signing regulatory reports and manifests';
COMMENT ON COLUMN public.jurisdiction_configs.fulfillment_low_stock_threshold IS 'Threshold for low stock alerts in certificate fulfillment';

-- Update existing CA configuration with current environment variable values
DO $$
BEGIN
    UPDATE public.jurisdiction_configs 
    SET 
        certificate_issuer_name = 'Acme Driving Academy',
        certificate_issuer_license = 'CA-INS-000123',
        support_phone = '1-800-PERMIT',
        fulfillment_low_stock_threshold = 200
    WHERE jurisdiction_id = (SELECT id FROM public.jurisdictions WHERE code = 'CA');
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but continue
        RAISE NOTICE 'Error updating CA jurisdiction config: %', SQLERRM;
END $$;

-- Create a view for easy access to jurisdiction configuration
CREATE OR REPLACE VIEW public.v_jurisdiction_config AS
SELECT 
    j.code AS j_code,
    j.name AS jurisdiction_name,
    jc.final_exam_questions,
    jc.final_exam_pass_pct,
    jc.seat_time_required_minutes,
    jc.certificate_prefix,
    jc.certificate_issuer_name,
    jc.certificate_issuer_license,
    jc.disclaimer,
    jc.support_email,
    jc.support_phone,
    jc.terms_url,
    jc.privacy_url,
    jc.regulatory_signing_secret,
    jc.fulfillment_low_stock_threshold,
    jc.updated_at
FROM public.jurisdictions j
LEFT JOIN public.jurisdiction_configs jc ON jc.jurisdiction_id = j.id
WHERE jc.jurisdiction_id IS NOT NULL;

-- Grant appropriate permissions
GRANT SELECT ON public.v_jurisdiction_config TO authenticated;
GRANT SELECT ON public.v_jurisdiction_config TO anon;
