-- Sprint 17: Security, Privacy & Compliance Hardening
-- DSAR (Data Subject Access Rights), Audit Logs, and Security Features

-- Create enums for export and deletion status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_status') THEN
        CREATE TYPE public.export_status AS ENUM ('pending', 'ready', 'error');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deletion_status') THEN
        CREATE TYPE public.deletion_status AS ENUM ('pending', 'confirmed', 'executed', 'canceled');
    END IF;
END$$;

-- Create data_exports table for DSAR export requests
CREATE TABLE IF NOT EXISTS public.data_exports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.export_status NOT NULL DEFAULT 'pending',
    bundle_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    error TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Create deletion_requests table for DSAR deletion requests
CREATE TABLE IF NOT EXISTS public.deletion_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.deletion_status NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    reason TEXT,
    confirmation_token TEXT UNIQUE,
    token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Create audit_logs table for tamper-evident audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id UUID REFERENCES auth.users(id),
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    object_table TEXT NOT NULL,
    object_id TEXT,
    before JSONB,
    after JSONB,
    ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    signature TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS data_exports_user_id_idx ON public.data_exports (user_id);
CREATE INDEX IF NOT EXISTS data_exports_status_idx ON public.data_exports (status);
CREATE INDEX IF NOT EXISTS data_exports_created_at_idx ON public.data_exports (created_at);

CREATE INDEX IF NOT EXISTS deletion_requests_user_id_idx ON public.deletion_requests (user_id);
CREATE INDEX IF NOT EXISTS deletion_requests_status_idx ON public.deletion_requests (status);
CREATE INDEX IF NOT EXISTS deletion_requests_token_idx ON public.deletion_requests (confirmation_token);

CREATE INDEX IF NOT EXISTS audit_logs_actor_user_id_idx ON public.audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_object_table_idx ON public.audit_logs (object_table);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at);

-- Add updated_at trigger to data_exports
DROP TRIGGER IF EXISTS data_exports_updated_at_trigger ON public.data_exports;
CREATE TRIGGER data_exports_updated_at_trigger
    BEFORE UPDATE ON public.data_exports
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- Function to generate HMAC signature for audit logs
CREATE OR REPLACE FUNCTION public.generate_audit_signature(
    actor_user_id UUID,
    actor_role TEXT,
    action TEXT,
    object_table TEXT,
    object_id TEXT,
    before_data JSONB,
    after_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ
) RETURNS TEXT AS $$
DECLARE
    audit_key TEXT;
    payload JSONB;
BEGIN
    -- Get audit key from GUC (set by application)
    audit_key := current_setting('app.audit_key', true);
    
    IF audit_key IS NULL OR audit_key = '' THEN
        RAISE EXCEPTION 'Audit key not configured';
    END IF;
    
    -- Build payload for signature
    payload := jsonb_build_object(
        'actor_user_id', actor_user_id,
        'actor_role', actor_role,
        'action', action,
        'object_table', object_table,
        'object_id', object_id,
        'before', coalesce(before_data, 'null'::jsonb),
        'after', coalesce(after_data, 'null'::jsonb),
        'ip', coalesce(ip_address::text, 'null'),
        'user_agent', coalesce(user_agent, 'null'),
        'created_at', created_at
    );
    
    -- Generate HMAC-SHA256 signature
    RETURN encode(
        hmac(
            payload::text,
            audit_key,
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit(
    p_action TEXT,
    p_object_table TEXT,
    p_object_id TEXT DEFAULT NULL,
    p_before JSONB DEFAULT NULL,
    p_after JSONB DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_actor_user_id UUID;
    v_actor_role TEXT;
    v_ip INET;
    v_user_agent TEXT;
    v_signature TEXT;
BEGIN
    -- Get current user info from JWT
    v_actor_user_id := (auth.jwt() ->> 'sub')::UUID;
    v_actor_role := auth.jwt() -> 'app_metadata' ->> 'role';
    
    -- Get IP and user agent from request context (set by application)
    v_ip := current_setting('app.request_ip', true)::INET;
    v_user_agent := current_setting('app.request_user_agent', true);
    
    -- Generate signature
    v_signature := public.generate_audit_signature(
        v_actor_user_id,
        v_actor_role,
        p_action,
        p_object_table,
        p_object_id,
        p_before,
        p_after,
        v_ip,
        v_user_agent,
        now()
    );
    
    -- Insert audit log
    INSERT INTO public.audit_logs (
        actor_user_id,
        actor_role,
        action,
        object_table,
        object_id,
        before,
        after,
        ip,
        user_agent,
        signature
    ) VALUES (
        v_actor_user_id,
        v_actor_role,
        p_action,
        p_object_table,
        p_object_id,
        p_before,
        p_after,
        v_ip,
        v_user_agent,
        v_signature
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify audit log signature
CREATE OR REPLACE FUNCTION public.verify_audit_signature(audit_log_id BIGINT) RETURNS BOOLEAN AS $$
DECLARE
    log_record RECORD;
    expected_signature TEXT;
BEGIN
    -- Get the audit log record
    SELECT * INTO log_record
    FROM public.audit_logs
    WHERE id = audit_log_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Generate expected signature
    expected_signature := public.generate_audit_signature(
        log_record.actor_user_id,
        log_record.actor_role,
        log_record.action,
        log_record.object_table,
        log_record.object_id,
        log_record.before,
        log_record.after,
        log_record.ip,
        log_record.user_agent,
        log_record.created_at
    );
    
    -- Compare signatures
    RETURN log_record.signature = expected_signature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
-- Only log specific columns to avoid PII exposure

-- Trigger for certificates table
CREATE OR REPLACE FUNCTION public.audit_certificates_trigger() RETURNS TRIGGER AS $$
DECLARE
    before_data JSONB;
    after_data JSONB;
BEGIN
    -- Only log non-sensitive fields
    IF TG_OP = 'INSERT' THEN
        after_data := jsonb_build_object(
            'id', NEW.id,
            'certificate_number', NEW.certificate_number,
            'status', NEW.status,
            'issued_at', NEW.issued_at,
            'course_id', NEW.course_id,
            'user_id', NEW.user_id
        );
        PERFORM public.log_audit('INSERT', 'certificates', NEW.id::text, NULL, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'certificate_number', OLD.certificate_number,
            'status', OLD.status,
            'issued_at', OLD.issued_at,
            'course_id', OLD.course_id,
            'user_id', OLD.user_id
        );
        after_data := jsonb_build_object(
            'id', NEW.id,
            'certificate_number', NEW.certificate_number,
            'status', NEW.status,
            'issued_at', NEW.issued_at,
            'course_id', NEW.course_id,
            'user_id', NEW.user_id
        );
        PERFORM public.log_audit('UPDATE', 'certificates', NEW.id::text, before_data, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'certificate_number', OLD.certificate_number,
            'status', OLD.status,
            'issued_at', OLD.issued_at,
            'course_id', OLD.course_id,
            'user_id', OLD.user_id
        );
        PERFORM public.log_audit('DELETE', 'certificates', OLD.id::text, before_data, NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for certificates
DROP TRIGGER IF EXISTS audit_certificates_trigger ON public.certificates;
CREATE TRIGGER audit_certificates_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_certificates_trigger();

-- Trigger for enrollments table
CREATE OR REPLACE FUNCTION public.audit_enrollments_trigger() RETURNS TRIGGER AS $$
DECLARE
    before_data JSONB;
    after_data JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        after_data := jsonb_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'course_id', NEW.course_id,
            'status', NEW.status,
            'enrolled_at', NEW.enrolled_at,
            'completed_at', NEW.completed_at
        );
        PERFORM public.log_audit('INSERT', 'enrollments', NEW.id::text, NULL, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'user_id', OLD.user_id,
            'course_id', OLD.course_id,
            'status', OLD.status,
            'enrolled_at', OLD.enrolled_at,
            'completed_at', OLD.completed_at
        );
        after_data := jsonb_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'course_id', NEW.course_id,
            'status', NEW.status,
            'enrolled_at', NEW.enrolled_at,
            'completed_at', NEW.completed_at
        );
        PERFORM public.log_audit('UPDATE', 'enrollments', NEW.id::text, before_data, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'user_id', OLD.user_id,
            'course_id', OLD.course_id,
            'status', OLD.status,
            'enrolled_at', OLD.enrolled_at,
            'completed_at', OLD.completed_at
        );
        PERFORM public.log_audit('DELETE', 'enrollments', OLD.id::text, before_data, NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollments
DROP TRIGGER IF EXISTS audit_enrollments_trigger ON public.enrollments;
CREATE TRIGGER audit_enrollments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_enrollments_trigger();

-- Trigger for jurisdiction_configs table
CREATE OR REPLACE FUNCTION public.audit_jurisdiction_configs_trigger() RETURNS TRIGGER AS $$
DECLARE
    before_data JSONB;
    after_data JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        after_data := jsonb_build_object(
            'id', NEW.id,
            'jurisdiction_id', NEW.jurisdiction_id,
            'config_key', NEW.config_key,
            'config_value', NEW.config_value,
            'updated_at', NEW.updated_at
        );
        PERFORM public.log_audit('INSERT', 'jurisdiction_configs', NEW.id::text, NULL, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'jurisdiction_id', OLD.jurisdiction_id,
            'config_key', OLD.config_key,
            'config_value', OLD.config_value,
            'updated_at', OLD.updated_at
        );
        after_data := jsonb_build_object(
            'id', NEW.id,
            'jurisdiction_id', NEW.jurisdiction_id,
            'config_key', NEW.config_key,
            'config_value', NEW.config_value,
            'updated_at', NEW.updated_at
        );
        PERFORM public.log_audit('UPDATE', 'jurisdiction_configs', NEW.id::text, before_data, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'jurisdiction_id', OLD.jurisdiction_id,
            'config_key', OLD.config_key,
            'config_value', OLD.config_value,
            'updated_at', OLD.updated_at
        );
        PERFORM public.log_audit('DELETE', 'jurisdiction_configs', OLD.id::text, before_data, NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for jurisdiction_configs
DROP TRIGGER IF EXISTS audit_jurisdiction_configs_trigger ON public.jurisdiction_configs;
CREATE TRIGGER audit_jurisdiction_configs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.jurisdiction_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_jurisdiction_configs_trigger();

-- Trigger for billing_prices table
CREATE OR REPLACE FUNCTION public.audit_billing_prices_trigger() RETURNS TRIGGER AS $$
DECLARE
    before_data JSONB;
    after_data JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        after_data := jsonb_build_object(
            'id', NEW.id,
            'course_id', NEW.course_id,
            'price_id', NEW.price_id,
            'is_active', NEW.is_active,
            'created_at', NEW.created_at
        );
        PERFORM public.log_audit('INSERT', 'billing_prices', NEW.id::text, NULL, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'course_id', OLD.course_id,
            'price_id', OLD.price_id,
            'is_active', OLD.is_active,
            'created_at', OLD.created_at
        );
        after_data := jsonb_build_object(
            'id', NEW.id,
            'course_id', NEW.course_id,
            'price_id', NEW.price_id,
            'is_active', NEW.is_active,
            'created_at', NEW.created_at
        );
        PERFORM public.log_audit('UPDATE', 'billing_prices', NEW.id::text, before_data, after_data);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        before_data := jsonb_build_object(
            'id', OLD.id,
            'course_id', OLD.course_id,
            'price_id', OLD.price_id,
            'is_active', OLD.is_active,
            'created_at', OLD.created_at
        );
        PERFORM public.log_audit('DELETE', 'billing_prices', OLD.id::text, before_data, NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for billing_prices
DROP TRIGGER IF EXISTS audit_billing_prices_trigger ON public.billing_prices;
CREATE TRIGGER audit_billing_prices_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.billing_prices
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_billing_prices_trigger();

-- Enable RLS on new tables
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_exports
DROP POLICY IF EXISTS data_exports_owner_select ON public.data_exports;
CREATE POLICY data_exports_owner_select
    ON public.data_exports FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS data_exports_owner_insert ON public.data_exports;
CREATE POLICY data_exports_owner_insert
    ON public.data_exports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS data_exports_admin_select ON public.data_exports;
CREATE POLICY data_exports_admin_select
    ON public.data_exports FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS data_exports_admin_update ON public.data_exports;
CREATE POLICY data_exports_admin_update
    ON public.data_exports FOR UPDATE
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RLS Policies for deletion_requests
DROP POLICY IF EXISTS deletion_requests_owner_select ON public.deletion_requests;
CREATE POLICY deletion_requests_owner_select
    ON public.deletion_requests FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS deletion_requests_owner_insert ON public.deletion_requests;
CREATE POLICY deletion_requests_owner_insert
    ON public.deletion_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS deletion_requests_admin_select ON public.deletion_requests;
CREATE POLICY deletion_requests_admin_select
    ON public.deletion_requests FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS deletion_requests_admin_update ON public.deletion_requests;
CREATE POLICY deletion_requests_admin_update
    ON public.deletion_requests FOR UPDATE
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RLS Policies for audit_logs (admin only)
DROP POLICY IF EXISTS audit_logs_admin_select ON public.audit_logs;
CREATE POLICY audit_logs_admin_select
    ON public.audit_logs FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Function to handle user deletion (preserves audit trail)
CREATE OR REPLACE FUNCTION public.execute_user_deletion(user_uuid UUID) RETURNS VOID AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get user email before deletion for audit
    SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
    
    -- Log the deletion request
    PERFORM public.log_audit(
        'USER_DELETION',
        'auth.users',
        user_uuid::text,
        jsonb_build_object('email', user_email),
        NULL
    );
    
    -- Void all certificates (don't delete, just mark as void)
    UPDATE public.certificates
    SET status = 'void'
    WHERE user_id = user_uuid;
    
    -- Delete enrollments (cascade will handle related data)
    DELETE FROM public.enrollments WHERE user_id = user_uuid;
    
    -- Delete seat time records
    DELETE FROM public.seat_time WHERE user_id = user_uuid;
    
    -- Delete attempts
    DELETE FROM public.attempts WHERE user_id = user_uuid;
    
    -- Delete data exports
    DELETE FROM public.data_exports WHERE user_id = user_uuid;
    
    -- Delete deletion requests
    DELETE FROM public.deletion_requests WHERE user_id = user_uuid;
    
    -- Note: We don't delete the user from auth.users here
    -- The application should handle this through Supabase Auth API
    -- to ensure proper cleanup of auth-related data
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate confirmation token for deletion requests
CREATE OR REPLACE FUNCTION public.generate_deletion_token() RETURNS TEXT AS $$
BEGIN
    -- Generate a secure random token
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set initial audit key placeholder (must be changed in production)
-- This is documented in the runbook for proper setup
SELECT set_config('app.audit_key', 'CHANGE_ME_IN_SUPABASE', true);
