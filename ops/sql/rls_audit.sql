-- Lists public tables with RLS disabled OR with zero policies.
with tables as (
  select n.nspname as schema, c.relname as table, c.oid, c.relrowsecurity as rls_on
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
), pol_count as (
  select polrelid as oid, count(*) as policies
  from pg_policy
  group by polrelid
)
select t.schema, t.table, t.rls_on, coalesce(p.policies,0) as policies
from tables t
left join pol_count p on p.oid = t.oid
where (t.rls_on = false) or coalesce(p.policies,0) = 0
order by t.table;
