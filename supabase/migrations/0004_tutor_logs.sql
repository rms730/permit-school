-- 0004_tutor_logs.sql
-- Minimal logging for tutor calls

create table if not exists public.tutor_logs (
    id bigserial primary key,
    user_id uuid,                       -- nullable until auth lands
    j_code text not null check (char_length(j_code) = 2),
    query text not null,
    top_k int not null check (top_k between 1 and 50),
    latency_ms int not null check (latency_ms >= 0),
    model text,                         -- e.g., 'gpt-4o-mini'
    error text,                         -- null on success
    created_at timestamptz default now()
);

alter table public.tutor_logs enable row level security;

-- Admins may read logs
do $plpgsql$ begin
    create policy "tutor_logs_admin_read"
        on public.tutor_logs
        for select
        using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
exception
    when duplicate_object then null;
end $plpgsql$;

-- Inserts will be performed by server with the service role, which bypasses RLS.
-- No insert/update/delete policies required at this time.

-- Helpful index for recency and filtering
create index if not exists tutor_logs_created_at_idx on public.tutor_logs (created_at desc);
create index if not exists tutor_logs_j_code_idx on public.tutor_logs (j_code);
