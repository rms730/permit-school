-- 0008_security_privacy.sql
-- Security, Privacy & Compliance Hardening - DSAR, Audit Logs, and Security Features

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

-- RLS policies for security tables
CREATE POLICY data_exports_select_own
    ON public.data_exports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY data_exports_insert_own
    ON public.data_exports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY data_exports_admin_all
    ON public.data_exports FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY deletion_requests_select_own
    ON public.deletion_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY deletion_requests_insert_own
    ON public.deletion_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY deletion_requests_admin_all
    ON public.deletion_requests FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY audit_logs_admin_only
    ON public.audit_logs FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
