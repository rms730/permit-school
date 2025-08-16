-- 0011_billing_lifecycle.sql
-- Billing lifecycle management

-- Types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_dunning_state') THEN
        CREATE TYPE public.billing_dunning_state AS ENUM (
            'none',
            'email_1',
            'email_2', 
            'email_3',
            'canceled'
        );
    END IF;
END$$;

-- Tables
CREATE TABLE IF NOT EXISTS public.billing_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_invoice_id text NOT NULL UNIQUE,
    subscription_id uuid REFERENCES public.subscriptions(id),
    status text NOT NULL CHECK (
        status IN ('draft', 'open', 'paid', 'uncollectible', 'void')
    ),
    amount_due_cents int NOT NULL CHECK (amount_due_cents >= 0),
    amount_paid_cents int NOT NULL DEFAULT 0 CHECK (amount_paid_cents >= 0),
    currency text NOT NULL DEFAULT 'usd',
    hosted_invoice_url text,
    pdf_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    period_start timestamptz,
    period_end timestamptz
);

CREATE TABLE IF NOT EXISTS public.billing_dunning (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    state billing_dunning_state NOT NULL DEFAULT 'none',
    fail_count int NOT NULL DEFAULT 0 CHECK (fail_count >= 0),
    last_failed_at timestamptz,
    last_notified_at timestamptz,
    next_action_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Views
CREATE OR REPLACE VIEW public.v_billing_summary_my AS
SELECT
    s.user_id,
    s.status AS subscription_status,
    s.current_period_end,
    s.cancel_at_period_end,
    bi.status AS latest_invoice_status,
    bi.amount_due_cents AS latest_invoice_amount,
    bi.created_at AS latest_invoice_date,
    bd.state AS dunning_state,
    bd.next_action_at,
    bd.fail_count
FROM public.subscriptions AS s
LEFT JOIN LATERAL (
    SELECT 
        bi.status,
        bi.amount_due_cents,
        bi.created_at
    FROM public.billing_invoices AS bi
    WHERE s.id = bi.subscription_id
    ORDER BY bi.created_at DESC
    LIMIT 1
) AS bi ON true
LEFT JOIN public.billing_dunning AS bd ON s.user_id = bd.user_id
WHERE s.user_id = auth.uid();

-- Indexes
CREATE INDEX IF NOT EXISTS billing_invoices_user_id_created_at_idx 
    ON public.billing_invoices(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS billing_invoices_subscription_id_idx 
    ON public.billing_invoices(subscription_id);

CREATE INDEX IF NOT EXISTS billing_dunning_next_action_at_idx 
    ON public.billing_dunning(next_action_at);

-- Enable RLS
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_dunning ENABLE ROW LEVEL SECURITY;

-- Policies for billing_invoices
CREATE POLICY billing_invoices_owner_select
    ON public.billing_invoices
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY billing_invoices_admin_select
    ON public.billing_invoices
    FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Policies for billing_dunning (admin-only)
CREATE POLICY billing_dunning_admin_all
    ON public.billing_dunning
    FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Triggers
CREATE TRIGGER billing_dunning_updated_at
    BEFORE UPDATE ON public.billing_dunning
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();
