-- 0006_billing.sql

create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text not null unique,
  status text not null check (
    status in (
      'trialing','active','past_due','canceled','incomplete','incomplete_expired','unpaid','paused'
    )
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

create table if not exists public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  j_code text not null default 'CA',
  active boolean not null default false,
  source text not null default 'stripe',
  expires_at timestamptz,
  updated_at timestamptz default now(),
  primary key (user_id, j_code)
);

create index if not exists entitlements_active_idx on public.entitlements(active, expires_at);

create table if not exists public.billing_events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

alter table public.billing_customers enable row level security;

alter table public.subscriptions enable row level security;

alter table public.entitlements enable row level security;

alter table public.billing_events enable row level security;

create policy own_billing_customer_read
  on public.billing_customers
  for select
  using (auth.uid() = user_id);

create policy own_subscriptions_read
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

create policy own_entitlements_read
  on public.entitlements
  for select
  using (auth.uid() = user_id);

create policy billing_events_admin_read
  on public.billing_events
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace view public.v_user_entitlements as
select
  e.user_id,
  e.j_code,
  (
    e.active
    and (e.expires_at is null or e.expires_at > now())
  ) as active
from public.entitlements as e;
