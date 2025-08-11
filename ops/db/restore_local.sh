#!/usr/bin/env bash
set -euo pipefail
FILE="${1:?Usage: restore_local.sh <dump.sqlc>}"
: "${DATABASE_URL:?DATABASE_URL required (target)}"
pg_restore --clean --if-exists -d "$DATABASE_URL" "$FILE"
