-- 0014_cert_fulfillment.sql
-- Certificate Fulfillment (DL 400C) - Printer Export, Serial Inventory, Reconciliation & Reprints

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

-- Fulfillment batches
CREATE TABLE IF NOT EXISTS public.fulfillment_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    j_code TEXT NOT NULL CHECK (char_length(j_code) = 2),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','exported','reconciled','failed')),
    counts JSONB NOT NULL DEFAULT '{"queued":0,"exported":0,"mailed":0,"void":0,"reprint":0}'::jsonb,
    export_path TEXT,
    hmac_sha256 TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS cert_stock_available_idx ON public.cert_stock (j_code, is_used) WHERE is_used = FALSE;
CREATE INDEX IF NOT EXISTS fulfillment_items_status_idx ON public.fulfillment_items (status);
CREATE INDEX IF NOT EXISTS fulfillment_items_serial_idx ON public.fulfillment_items (serial);
CREATE INDEX IF NOT EXISTS fulfillment_items_mailed_idx ON public.fulfillment_items (mailed_at);

-- Enable RLS
ALTER TABLE public.cert_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_items ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin only)
CREATE POLICY cert_stock_admin_all ON public.cert_stock FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY fulfill_batches_admin_all ON public.fulfillment_batches FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY fulfill_items_admin_all ON public.fulfillment_items FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Touch trigger for updated_at
DROP TRIGGER IF EXISTS trg_fulfillment_batches_touch ON public.fulfillment_batches;
CREATE TRIGGER trg_fulfillment_batches_touch 
    BEFORE UPDATE ON public.fulfillment_batches 
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
