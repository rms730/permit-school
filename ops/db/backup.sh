#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL required}"
OUT="backup-$(date +%Y%m%d-%H%M%S).sqlc"
pg_dump "$DATABASE_URL" -Fc -f "$OUT"
echo "$OUT"
