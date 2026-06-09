---
description: Review workflow for Pera Garden code, docs, migrations, and rollout plans
---

# Pera Garden - Review Workflow

Use this when the user asks for a review, when a change touches security-sensitive paths, or before merging/deploying a meaningful feature.

## 1. Identify The Review Surface

Classify the review target:

- **Frontend** - public UI, admin UI, routing, styles, forms, accessibility.
- **Backend** - migrations, RLS, Storage policies, Edge Functions, secrets, service-role access.
- **Contract** - shared types, frontend service calls, Edge Function request/response shape.
- **Docs/process** - runbooks, agent workflows, deployment instructions.
- **Deploy readiness** - env vars, rollout order, verification, rollback.

If the review crosses surfaces, name the highest-risk surface first.

## 2. Read Context Before Judging

Read the changed files and the contracts they depend on:

- Frontend review: touched component/page, related service, related type, matching CSS, design rules.
- Backend review: migration sequence, relevant policy/helper/function, frontend caller, setup docs.
- Contract review: `app/src/types/index.ts`, service wrapper, Edge Function handler, documented spec.
- Docs review: linked docs, commands, paths, status claims.
- Deploy review: `docs/CONTEXT.md`, `docs/SETUP.md`, `docs/STATUS.md`, env/secrets references.

Avoid reviewing isolated snippets when the behavior depends on a connected flow.

## 3. Prioritize Findings

Lead with concrete risks, ordered by severity:

- **P0** - data leak, secret exposure, auth bypass, production outage, destructive migration.
- **P1** - broken core MVP flow, RLS mistake, failed contact submission, failed admin access, deployment blocker.
- **P2** - accessibility issue, mobile usability issue, missing error state, fragile contract, missing important verification.
- **P3** - maintainability, copy, polish, small consistency issue.

Each finding should include:

- file and line reference when possible
- what breaks or could break
- why the current project constraints make it matter
- a concrete fix direction

Do not pad the review with low-value style comments.

## 4. Check MVP Boundaries

Ask:

- Does this preserve the Hero -> Contact -> WhatsApp -> Admin retry loop?
- Does this keep public reads limited to published content?
- Does this keep submissions private to admins?
- Does this keep secrets out of the frontend?
- Does this stay inside free-tier assumptions?
- Does this introduce V1 complexity into MVP without a strong reason?

If the answer is unclear, call it out as an open question.

## 5. Verify Or State The Gap

Useful checks by review type:

- Frontend: `npm run lint`, `npm run build`, mobile and desktop browser check.
- Backend: SQL verification query, RLS behavior, Edge Function smoke request.
- Contact form: invalid payload, valid payload, rate limit, WhatsApp retry-ready failure.
- Docs: path/command accuracy and status consistency.
- Deploy: secrets present, rollout order, rollback path, go-live checklist.

If a check cannot run locally, say exactly what remains unverified.

## 6. Review Output

Use this order:

1. Findings, highest severity first.
2. Open questions or assumptions.
3. Verification performed.
4. Short summary.

If there are no findings, say so directly and name any residual test or deployment risk.
