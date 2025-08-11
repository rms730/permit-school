-- 0018_billing_lifecycle.sql

-- Types
create type public.billing_dunning_state as enum (
  'none',
  'email_1',
  'email_2', 
  'email_3',
  'canceled'
);

-- Tables
create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_invoice_id text not null unique,
  subscription_id uuid references public.subscriptions(id),
  status text not null check (
    status in ('draft', 'open', 'paid', 'uncollectible', 'void')
  ),
  amount_due_cents int not null check (amount_due_cents >= 0),
  amount_paid_cents int not null default 0 check (amount_paid_cents >= 0),
  currency text not null default 'usd',
  hosted_invoice_url text,
  pdf_url text,
  created_at timestamptz not null default now(),
  period_start timestamptz,
  period_end timestamptz
);

create table if not exists public.billing_dunning (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state billing_dunning_state not null default 'none',
  fail_count int not null default 0 check (fail_count >= 0),
  last_failed_at timestamptz,
  last_notified_at timestamptz,
  next_action_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Views
create or replace view public.v_billing_summary_my as
select
  s.user_id,
  s.status as subscription_status,
  s.current_period_end,
  s.cancel_at_period_end,
  bi.status as latest_invoice_status,
  bi.amount_due_cents as latest_invoice_amount,
  bi.created_at as latest_invoice_date,
  bd.state as dunning_state,
  bd.next_action_at,
  bd.fail_count
from public.subscriptions as s
left join lateral (
  select 
    bi.status,
    bi.amount_due_cents,
    bi.created_at
  from public.billing_invoices as bi
  where s.id = bi.subscription_id
  order by bi.created_at desc
  limit 1
) as bi on true
left join public.billing_dunning as bd on s.user_id = bd.user_id
where s.user_id = auth.uid();

-- Indexes
create index if not exists billing_invoices_user_id_created_at_idx 
  on public.billing_invoices(user_id, created_at desc);

create index if not exists billing_invoices_subscription_id_idx 
  on public.billing_invoices(subscription_id);

create index if not exists billing_dunning_next_action_at_idx 
  on public.billing_dunning(next_action_at);

-- RLS
alter table public.billing_invoices enable row level security;
alter table public.billing_dunning enable row level security;

-- Policies for billing_invoices
create policy billing_invoices_owner_select
  on public.billing_invoices
  for select
  using (auth.uid() = user_id);

create policy billing_invoices_admin_select
  on public.billing_invoices
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Policies for billing_dunning (admin-only)
create policy billing_dunning_admin_all
  on public.billing_dunning
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Triggers
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger billing_dunning_updated_at
  before update on public.billing_dunning
  for each row
  execute function public.touch_updated_at();
