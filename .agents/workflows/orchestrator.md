---
description: Entry workflow for routing Pera Garden work to the right specialist path
---

# Pera Garden - Orchestrator Workflow

Use this first when a request is more than a quick factual answer. The orchestrator's job is to classify the work, choose the right workflow, keep scope small, and make sure verification matches the risk.

## 1. Classify The Request

Pick the primary mode before touching files:

- **Brainstorm** - shaping product, UX, copy, or feature scope before implementation.
- **Structure** - changing folders, boundaries, hooks, shared components, or agent workflow docs.
- **Build** - implementing a frontend or full-stack feature inside the current architecture.
- **Backend** - changing migrations, RLS, Storage policies, Edge Functions, secrets, or data contracts.
- **Deploy** - preparing or checking production rollout.
- **Review** - evaluating existing code or plans for bugs, risks, and missing checks.

If the request crosses modes, keep one primary mode and name the secondary mode. Example: "Build primary, Backend secondary."

## 2. Load The Right Context

Always read only what the mode needs:

- Frontend/UI work: `skills/frontend/SKILL.md`, `rules/design.md`, touched app files, matching CSS.
- Backend/API work: `skills/backend/SKILL.md`, relevant migration, relevant Edge Function, frontend caller.
- Product ideation: `workflows/brainstorm.md`, `docs/BUILD_READY_SPEC.md`, current public section/page.
- Structural work: `workflows/struct.md`, current folders, docs that describe the target structure.
- Deploy work: `workflows/deploy.md`, `docs/SUPABASE_SETUP.md`, env/secrets references.
- Review work: the changed files, contracts they depend on, and the checks that prove them.

Do not bulk-read unrelated files just because they exist.

## 3. Decide Scope

Before implementation, identify:

- the user-facing outcome
- the owner/admin outcome, if any
- whether Supabase data, RLS, Storage, Edge Functions, or secrets are involved
- whether the request is MVP-critical, V1, or future/backlog
- the smallest change that leaves the next contributor in a better position

Stay inside the free-tier stack unless the user explicitly approves a paid service or external dependency.

## 4. Route The Work

Use these defaults:

- Public section, admin screen, styling, forms, routing: CAN / frontend skill.
- Schema, policies, rate limits, WhatsApp, Turnstile, service role: Kaan / backend skill.
- Both UI and backend contract: read both skills, then let the frontend contract and backend safety constraints meet in the service layer.
- Docs, `.agents`, project process: structure workflow plus this orchestrator.

When in doubt, preserve the current MVP vertical slice rather than expanding architecture.

## 5. Verification Plan

Match checks to risk:

- Docs/process only: read changed Markdown and verify links/paths are correct.
- Frontend only: `npm run lint`, `npm run build`, mobile-first visual check.
- Admin changes: unauthenticated state, authenticated admin state, non-admin state when possible.
- Contact form changes: validation error path, successful insert path, WhatsApp failure/retry path when credentials allow.
- Backend changes: migration order, RLS behavior, function contract, relevant SQL verification query.
- Deploy changes: rollout order, secrets, rollback note, post-deploy smoke test.

If a check cannot run, state why and what remains unverified.

## 6. Handoff Format

When finishing, report:

- what changed
- why it fits the current architecture
- what was verified
- what risk or follow-up remains

Keep the answer short unless the user asks for a deep report.
