---
description: Entry workflow for routing Pera Garden work to the right specialist path
---

# Pera Garden — Orchestrator

Use first when a request is more than a quick factual answer. Job: classify, route, keep scope small, match verification to risk.

**Always load `docs/CONTEXT.md` first** (invariants + live state). Load other files on demand per the table below — never bulk-read the doc set.

## Routing table

| Mode | Use when | Owner | Load on demand | Verify |
|------|----------|-------|----------------|--------|
| **Brainstorm** | Shaping product/UX/copy/scope pre-build | — | `workflows/brainstorm.md`, current section/page, `docs/SETUP.md` §Contracts | Read changed Markdown; confirm links/paths |
| **Structure** | Folders, boundaries, hooks, shared components, agent/workflow docs | structure wf + this file | `workflows/struct.md`, current folders, `docs/DECISIONS.md` | Read changed Markdown; confirm links/paths |
| **Build** | Frontend/full-stack feature in current architecture | CAN / frontend skill | `skills/frontend/SKILL.md`, `rules/design.md`, touched app files + CSS | `npm run lint` + `build`; mobile-first check; admin states (unauth/admin/non-admin); contact form paths |
| **Backend** | Migrations, RLS, Storage, Edge Functions, secrets, data contracts | Kaan / backend skill | `skills/backend/SKILL.md`, relevant migration + Edge Function + frontend caller, `docs/SETUP.md` §Contracts | Migration order; RLS behavior; function contract; `supabase/verify_compact.sql` |
| **Deploy** | Production rollout prep/check | deploy wf | `workflows/deploy.md`, `docs/SETUP.md`, `docs/STATUS.md` | Rollout order; secrets; rollback note; post-deploy smoke test |
| **Review** | Evaluating code/plans for bugs, risk, missing checks | — | Changed files, contracts they depend on, `docs/STATUS.md` | Re-run the checks that prove the changed contracts |

Cross-mode: keep one primary, name the secondary (e.g. "Build primary, Backend secondary"). For UI+backend contracts, read both skills and let frontend contract meet backend safety in the service layer.

## Scope (before implementing)
Identify: user-facing outcome · owner/admin outcome (if any) · whether Supabase data/RLS/Storage/Functions/secrets are touched · MVP-critical vs V1 vs backlog · the smallest change that leaves the next contributor better off.

Invariants (free-tier only, secrets-never-in-Vite, Edge-Function-only contact, admin = active profile, anon reads published only) live in `docs/CONTEXT.md` — respect them; don't restate them. When in doubt, preserve the current MVP vertical slice over expanding architecture.

## Handoff
Report: what changed · why it fits the architecture · what was verified · remaining risk/follow-up. If a check couldn't run, say why and what's unverified. Keep it short unless a deep report is asked.
