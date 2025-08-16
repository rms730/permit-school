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
    id bigserial PRIMARY KEY,
    j_code text NOT NULL CHECK (char_length(j_code) = 2),
    serial text NOT NULL,
    is_used boolean NOT NULL DEFAULT false,
    used_by_certificate uuid,
    used_at timestamptz,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (j_code, serial)
);

-- Fulfillment batches
CREATE TABLE IF NOT EXISTS public.fulfillment_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    j_code text NOT NULL CHECK (char_length(j_code) = 2),
    course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','exported','reconciled','failed')),
    counts jsonb NOT NULL DEFAULT '{"queued":0,"exported":0,"mailed":0,"void":0,"reprint":0}'::jsonb,
    export_path text,
    hmac_sha256 text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Fulfillment items
CREATE TABLE IF NOT EXISTS public.fulfillment_items (
    batch_id uuid NOT NULL REFERENCES public.fulfillment_batches(id) ON DELETE CASCADE,
    certificate_id uuid NOT NULL REFERENCES public.certificates(id) ON DELETE RESTRICT,
    serial text NOT NULL,
    status public.cert_fulfillment_status NOT NULL DEFAULT 'queued',
    mailed_at timestamptz,
    tracking text,
    exception_reason text,
    snapshot jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (batch_id, certificate_id),
    UNIQUE (certificate_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS cert_stock_available_idx ON public.cert_stock (j_code, is_used) WHERE is_used = false;
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
