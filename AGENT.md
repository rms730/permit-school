# Agent Playbook

## Cursor Working Agreement (Repo-Scoped)

**Always do this:**

1. **Be persistent** — keep going until the job is fully solved.
2. **Use tools, don't guess** — open files, run commands, capture logs.
3. **Plan then reflect** — write a short plan first; reflect after each run.

**Template to use in every tool run:**

**PLAN**

- …

**RUN**

- …

**REFLECT**

- …

See project rules in `.cursorrules` for details and guardrails (MUI-only UI, sqlfluff-clean SQL, RLS on all tables, EN/ES i18n, CI must stay green).

---

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
