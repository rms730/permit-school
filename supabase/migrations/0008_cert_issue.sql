-- 0008_cert_issue.sql
-- Certificate issuance and verification

-- Add new fields to certificates table
alter table public.certificates
add column if not exists number text unique,
add column if not exists pdf_path text,
add column if not exists issued_by uuid references auth.users(id),
add column if not exists issued_at timestamptz,
add column if not exists voided_at timestamptz,
add column if not exists void_reason text;

-- Create sequence for certificate numbering
create sequence if not exists certificate_no_seq;

-- Function to generate certificate numbers
create or replace function public.make_certificate_number(j_code text)
returns text language sql stable as $$
  select format('%s-%s-%06s',
    j_code,
    to_char(now(), 'YYYY'),
    nextval('certificate_no_seq')::text
  );
$$;

-- Add check constraint for status
alter table public.certificates
drop constraint if exists certificates_status_check;

alter table public.certificates
add constraint certificates_status_check
check (status in ('draft', 'issued', 'void'));

-- Create index on number for fast lookups
create index if not exists certificates_number_idx
on public.certificates(number);

-- Create storage bucket for certificates
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- Update RLS policies for certificates table
drop policy if exists certs_own_read on public.certificates;
drop policy if exists certs_admin_write on public.certificates;

-- Users can read their own certificates (draft or issued only)
create policy certs_own_read
on public.certificates for select
using (
  auth.uid() = student_id
  and status in ('draft', 'issued')
);

-- Admins can read all certificates
create policy certs_admin_read
on public.certificates for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can update all certificates
create policy certs_admin_update
on public.certificates for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can insert certificates
create policy certs_admin_insert
on public.certificates for insert
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
