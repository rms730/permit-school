#!/usr/bin/env bash
set -euo pipefail
: "${CURSOR_TOKEN:?Set CURSOR_TOKEN}"
TASK="${TASK:-Bootstrap task from PLAN.md}"
MODEL="${MODEL:-gpt-5}"
echo "[cursor] Starting agent with model=$MODEL task=$TASK"
cursor-agent -p "Follow PLAN.md objective: ${TASK}. Satisfy acceptance tests. Open a PR if green; otherwise push WIP with diagnostics." \
  --model "${MODEL}" --output-format json || true
