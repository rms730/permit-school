-- Sprint 26: Certificate Fulfillment (DL 400C)
-- Printer Export, Serial Inventory, Reconciliation & Reprints

-- Enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cert_fulfillment_status') THEN
        CREATE TYPE public.cert_fulfillment_status AS ENUM ('queued','exported','mailed','void','reprint');
    END IF;
END$$;

-- Certificate stock inventory
CREATE TABLE IF NOT EXISTS public.cert_stock (
    id BIGSERIAL PRIMARY KEY,
    j_code TEXT NOT NULL CHECK (char_length(j_code) = 2),
    serial TEXT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_by_certificate UUID,
    used_at TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (j_code, serial)
);

CREATE INDEX IF NOT EXISTS cert_stock_available_idx ON public.cert_stock (j_code, is_used) WHERE is_used = FALSE;

-- Fulfillment batches
CREATE TABLE IF NOT EXISTS public.fulfillment_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    j_code TEXT NOT NULL CHECK (char_length(j_code) = 2),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','exported','reconciled','failed')),
    counts JSONB NOT NULL DEFAULT '{"queued":0,"exported":0,"mailed":0,"void":0,"reprint":0}'::jsonb,
    export_path TEXT,
    hmac_sha256 TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fulfillment items
CREATE TABLE IF NOT EXISTS public.fulfillment_items (
    batch_id UUID NOT NULL REFERENCES public.fulfillment_batches(id) ON DELETE CASCADE,
    certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE RESTRICT,
    serial TEXT NOT NULL,
    status public.cert_fulfillment_status NOT NULL DEFAULT 'queued',
    mailed_at TIMESTAMPTZ,
    tracking TEXT,
    exception_reason TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (batch_id, certificate_id),
    UNIQUE (certificate_id)
);

CREATE INDEX IF NOT EXISTS fulfillment_items_status_idx ON public.fulfillment_items (status);
CREATE INDEX IF NOT EXISTS fulfillment_items_serial_idx ON public.fulfillment_items (serial);
CREATE INDEX IF NOT EXISTS fulfillment_items_mailed_idx ON public.fulfillment_items (mailed_at);

-- Add FK to auth.users defensively
do $$
begin
  if to_regclass('auth.users') is not null then
    execute $ddl$
      alter table public.fulfillment_batches
      add constraint fulfillment_batches_created_by_fkey
      foreign key (created_by) references auth.users(id)
      on delete set null;
    $ddl$;
  else
    raise notice 'auth.users not present at migration time; skipping FK for local apply';
  end if;
end$$;

-- Row Level Security
ALTER TABLE public.cert_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY cert_stock_admin_all ON public.cert_stock FOR ALL 
    USING (is_admin()) 
    WITH CHECK (is_admin());
CREATE POLICY fulfill_batches_admin_all ON public.fulfillment_batches FOR ALL 
    USING (is_admin()) 
    WITH CHECK (is_admin());
CREATE POLICY fulfill_items_admin_all ON public.fulfillment_items FOR ALL 
    USING (is_admin()) 
    WITH CHECK (is_admin());

-- Touch trigger for updated_at
DROP TRIGGER IF EXISTS trg_fulfillment_batches_touch ON public.fulfillment_batches;
CREATE TRIGGER trg_fulfillment_batches_touch BEFORE UPDATE ON public.fulfillment_batches 
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RPC: Allocate certificate serial atomically
CREATE OR REPLACE FUNCTION public.allocate_cert_serial(p_j_code TEXT) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_serial TEXT;
BEGIN
    SELECT serial INTO v_serial FROM public.cert_stock WHERE j_code = p_j_code AND is_used = FALSE 
        ORDER BY serial FOR UPDATE SKIP LOCKED LIMIT 1;
    
    IF v_serial IS NULL THEN
        RAISE EXCEPTION 'Out of certificate stock for %', p_j_code USING ERRCODE = 'P0001';
    END IF;
    
    UPDATE public.cert_stock SET is_used = TRUE, used_at = now() WHERE j_code = p_j_code AND serial = v_serial;
    
    RETURN v_serial;
END$$;

-- RPC: Create fulfillment batch
CREATE OR REPLACE FUNCTION public.create_fulfillment_batch(p_j_code TEXT, p_course_id UUID, p_creator UUID) 
    RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_batch_id UUID;
    v_cert RECORD;
    v_serial TEXT;
    v_snapshot JSONB;
BEGIN
    -- Create batch
    INSERT INTO public.fulfillment_batches (j_code, course_id, created_by) 
        VALUES (p_j_code, p_course_id, p_creator) RETURNING id INTO v_batch_id;
    
    -- Process eligible certificates
    FOR v_cert IN 
        SELECT 
            cert.id AS certificate_id,
            j.code AS j_code,
            c.id AS course_id,
            p.full_name,
            sp.first_name,
            sp.middle_name,
            sp.last_name,
            sp.dob,
            cert.passed_at::date AS completion_date,
            c.code AS course_code,
            c.title AS course_title,
            sp.address_line1,
            sp.address_line2,
            sp.city,
            sp.state,
            sp.postal_code
        FROM public.certificates AS cert
        INNER JOIN public.courses AS c ON cert.course_id = c.id
        INNER JOIN public.jurisdictions AS j ON c.jurisdiction_id = j.id
        INNER JOIN public.profiles AS p ON cert.student_id = p.id
        LEFT JOIN public.student_profiles AS sp ON sp.user_id = p.id
        LEFT JOIN public.fulfillment_items AS fi ON fi.certificate_id = cert.id
        WHERE j.code = p_j_code 
            AND cert.status = 'issued' 
            AND fi.certificate_id IS NULL
            AND (p_course_id IS NULL OR c.id = p_course_id)
    LOOP
        -- Allocate serial
        v_serial := public.allocate_cert_serial(p_j_code);
        
        -- Create snapshot
        v_snapshot := jsonb_build_object(
            'full_name', v_cert.full_name,
            'first_name', v_cert.first_name,
            'middle_name', v_cert.middle_name,
            'last_name', v_cert.last_name,
            'dob', v_cert.dob,
            'completion_date', v_cert.completion_date,
            'course_code', v_cert.course_code,
            'course_title', v_cert.course_title,
            'address_line1', v_cert.address_line1,
            'address_line2', v_cert.address_line2,
            'city', v_cert.city,
            'state', v_cert.state,
            'postal_code', v_cert.postal_code
        );
        
        -- Insert fulfillment item
        INSERT INTO public.fulfillment_items (batch_id, certificate_id, serial, snapshot) 
            VALUES (v_batch_id, v_cert.certificate_id, v_serial, v_snapshot);
        
        -- Update certificate number if blank
        UPDATE public.certificates SET number = v_serial WHERE id = v_cert.certificate_id AND number IS NULL;
    END LOOP;
    
    -- Update batch counts
    UPDATE public.fulfillment_batches 
    SET counts = (
        SELECT jsonb_build_object(
            'queued', count(*) FILTER (WHERE status = 'queued'),
            'exported', count(*) FILTER (WHERE status = 'exported'),
            'mailed', count(*) FILTER (WHERE status = 'mailed'),
            'void', count(*) FILTER (WHERE status = 'void'),
            'reprint', count(*) FILTER (WHERE status = 'reprint')
        )
        FROM public.fulfillment_items 
        WHERE batch_id = v_batch_id
    )
    WHERE id = v_batch_id;
    
    RETURN v_batch_id;
END$$;

-- RPC: Mark item as mailed
CREATE OR REPLACE FUNCTION public.mark_item_mailed(
    p_batch UUID, 
    p_certificate UUID, 
    p_tracking TEXT, 
    p_mailed_at TIMESTAMPTZ
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.fulfillment_items 
    SET status = 'mailed', mailed_at = p_mailed_at, tracking = p_tracking
    WHERE batch_id = p_batch AND certificate_id = p_certificate;
    
    RETURN FOUND;
END$$;

-- RPC: Void item and queue reprint
CREATE OR REPLACE FUNCTION public.void_item_and_queue_reprint(p_batch UUID, p_certificate UUID, p_reason TEXT) 
    RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_reprint_batch_id UUID;
    v_snapshot JSONB;
BEGIN
    -- Get current snapshot
    SELECT snapshot INTO v_snapshot FROM public.fulfillment_items 
        WHERE batch_id = p_batch AND certificate_id = p_certificate;
    
    IF v_snapshot IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Mark current item as void
    UPDATE public.fulfillment_items 
    SET status = 'void', exception_reason = p_reason
    WHERE batch_id = p_batch AND certificate_id = p_certificate;
    
    -- Find or create reprint batch
    SELECT id INTO v_reprint_batch_id 
    FROM public.fulfillment_batches 
    WHERE j_code = 'CA' AND status = 'pending' AND course_id IS NULL
    LIMIT 1;
    
    IF v_reprint_batch_id IS NULL THEN
        INSERT INTO public.fulfillment_batches (j_code, course_id, created_by) 
            VALUES ('CA', NULL, (SELECT created_by FROM public.fulfillment_batches WHERE id = p_batch))
            RETURNING id INTO v_reprint_batch_id;
    END IF;
    
    -- Insert reprint item (serial will be allocated on export)
    INSERT INTO public.fulfillment_items (batch_id, certificate_id, serial, status, snapshot) 
        VALUES (v_reprint_batch_id, p_certificate, '', 'reprint', v_snapshot);
    
    RETURN TRUE;
END$$;

-- View: Pending certificates for fulfillment
CREATE OR REPLACE VIEW public.v_fulfillment_pending AS
SELECT 
    cert.id AS certificate_id,
    j.code AS j_code,
    c.id AS course_id,
    p.full_name,
    sp.first_name,
    sp.middle_name,
    sp.last_name,
    sp.dob,
    cert.passed_at::date AS completion_date,
    c.code AS course_code,
    c.title AS course_title,
    sp.address_line1,
    sp.address_line2,
    sp.city,
    sp.state,
    sp.postal_code
FROM public.certificates AS cert
INNER JOIN public.courses AS c ON c.id = cert.course_id
INNER JOIN public.jurisdictions AS j ON j.id = c.jurisdiction_id
INNER JOIN public.profiles AS p ON p.id = cert.student_id
LEFT JOIN public.student_profiles AS sp ON p.id = sp.user_id
LEFT JOIN public.fulfillment_items AS fi ON cert.id = fi.certificate_id
WHERE j.code = 'CA' 
    AND cert.status = 'issued' 
    AND fi.certificate_id IS NULL;

-- View: Inventory status
CREATE OR REPLACE VIEW public.v_fulfillment_inventory AS
SELECT 
    j_code,
    count(*) AS total,
    count(*) FILTER (WHERE is_used = FALSE) AS available,
    count(*) FILTER (WHERE is_used = TRUE) AS used,
    max(used_at) AS last_used_at
FROM public.cert_stock
GROUP BY j_code;
