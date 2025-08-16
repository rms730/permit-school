#!/usr/bin/env bash
set -euo pipefail

echo "▶ Stopping any running Supabase for this project..."
supabase stop || true

echo "▶ Pruning old local volumes for this project (safe for local-only)..."
docker volume ls --filter "label=com.supabase.cli.project=$(basename $(pwd))" -q | xargs -r docker volume rm

echo "▶ Starting Supabase..."
supabase start

echo "▶ Status:"
supabase status

echo "▶ Verifying migrations applied in order:"
supabase db diff --linked --schema public || true
