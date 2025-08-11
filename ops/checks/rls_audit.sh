#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL required}"
FAILS=$(psql "$DATABASE_URL" -At -f ops/sql/rls_audit.sql || true)
if [ -n "$FAILS" ]; then
  echo "❌ RLS audit failed. Offenders:"
  echo "$FAILS"
  exit 1
fi
echo "✅ RLS audit passed (all public tables have RLS and ≥1 policy)."
