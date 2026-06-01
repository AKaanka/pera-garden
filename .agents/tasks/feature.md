# Feature Brief Template

Use this before building a new visitor-facing or admin-facing capability.

## Goal

- What user or owner problem does this solve?
- Is this MVP-critical, V1, or backlog?

## Scope

- In scope:
- Out of scope:

## User Flow

- Entry point:
- Main action:
- Success state:
- Error or empty state:

## Data Contract

- Frontend types:
- Supabase tables or JSONB section:
- RLS or Storage impact:
- Edge Function impact:
- Secrets or env impact:

## Files Likely Touched

- `app/src/types/index.ts`
- `app/src/services/`
- `app/src/sections/` or `app/src/pages/admin/`
- `app/src/App.css` / `app/src/index.css`
- `supabase/` if backend-backed

## Verification

- `npm run lint`
- `npm run build`
- Mobile visual check
- Admin auth states, if relevant
- Supabase/function smoke test, if relevant

## Rollout Notes

- Deployment order:
- Rollback plan:
- Follow-up debt:
