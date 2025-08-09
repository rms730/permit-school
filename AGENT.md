# Agent Playbook

## Goal
Iteratively scaffold a multi-state permit-prep platform. California (CA) first, Texas (TX) next.

## Branching
- Create feature branches as `feature/<short-kebab>`.
- Open a PR early and push incremental commits.

## PR Checklist
- [ ] Linted and tests run (`bash ops/checks/smoke.sh` at minimum)
- [ ] Descriptive title + body with risks/rollback
- [ ] Touch only files relevant to the task
- [ ] If SQL migration: include RLS policies and backfill/rollback notes

## Task cadence
- Each cycle: pick ONE 1–2 hour task (from PLAN.md).
- Leave acceptance tests or scriptable verification in the PR body.
