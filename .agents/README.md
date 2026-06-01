# Pera Garden — Agent Notes

This folder contains repo-specific guidance for working on **Pera Garden**, a dynamic one-page website for a wedding venue.

## Project at a glance

- **Name:** Pera Garden
- **Goal:** A dynamic single-page website for the Pera Garden wedding venue with an admin panel and a WhatsApp-notifying contact form.
- **Budget constraint:** Stay on free tiers wherever possible. No paid services unless absolutely necessary.
- **Owner profile:** Non-technical — the admin panel must be simple.

## Architecture (two layers)

- `app/` — Vite + React + TypeScript frontend (public one-pager + admin panel routes)
- `supabase/` — Postgres schema, Row Level Security, migrations, Storage buckets (for gallery images), and Edge Functions (for the WhatsApp webhook)

## Free-tier stack

| Concern | Choice | Why |
| --- | --- | --- |
| Frontend hosting | Vercel / Netlify / Cloudflare Pages | Free static hosting + HTTPS |
| Database + Auth + Storage | Supabase free tier | 500 MB DB, 1 GB storage, auth included |
| Serverless functions | Supabase Edge Functions | Free quota covers form submissions |
| WhatsApp notification | Meta WhatsApp Cloud API (free tier) | 1,000 conversations/month free |
| Spam protection | Cloudflare Turnstile | Free, privacy-friendly CAPTCHA |

## Shared conventions

- Shared TypeScript types live in `app/src/types/index.ts`.
- Shared styles live in `app/src/index.css` and `app/src/App.css`.
- Admin pages live under `app/src/pages/admin/` behind a Supabase Auth guard.
- Public sections live under `app/src/sections/` and are rendered in order on the one-pager.

## How to use the docs

- `workflows/orchestrator.md` — first stop for routing non-trivial work
- `skills/frontend/SKILL.md` — UI, sections, admin panel, responsive design
- `skills/backend/SKILL.md` — Supabase schema, RLS, Storage, Edge Functions
- `workflows/brainstorm.md` — shaping new ideas before building
- `workflows/struct.md` — structural and refactor decisions
- `workflows/build.md` — implementation flow
- `workflows/backend.md` — migrations, RLS, Edge Function workflow
- `workflows/deploy.md` — deployment and verification checklist
- `workflows/review.md` — code, docs, and rollout review workflow
- `tasks/feature.md` — feature brief template
- `tasks/review.md` — review brief template
- `tasks/deploy.md` — deployment brief template
- `rules/design.md` — UI guardrails

## Related project docs

- `../docs/BUILD_READY_SPEC.md` — MVP scope, contracts, and V1 boundary
- `../docs/DECISIONS.md` — accepted architecture and product decisions
- `../docs/ROADMAP.md` — recommended build sequence after the MVP slice
- `../docs/PHASE_0_AUDIT.md` — current MVP hardening audit and launch blockers
- `../docs/SUPABASE_SETUP.md` — target project setup and verification runbook
- `../docs/GO_LIVE_CHECKLIST.md` — production readiness checklist

These files are intentionally repo-specific. If the architecture changes, update them alongside the code.
