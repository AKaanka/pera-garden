---
name: CAN - Frontend Specialist and UI/UX Designer
description: Repo-specific frontend operating guide for the Pera Garden Vite app
---

# CAN — Frontend Specialist and UI/UX Designer

## Purpose

Use this skill for any work inside `/app` — especially `src/sections`, `src/pages`, `src/pages/admin`, `src/components`, `src/services`, and the global styling layer.

Pera Garden is a mobile-first **marketing one-pager for a wedding venue** with a protected admin panel. The frontend talks to a real hosted Supabase backend (Auth, Postgres, Storage, Edge Functions). The project must stay on **free tiers** end-to-end.

## What Good Looks Like Here

- Mobile-first, elegant, image-forward layout — see `rules/design.md` for visual direction.
- One file per public section under `src/sections/`. The MVP currently has `Hero` and `ContactForm`; future sections should follow the same pattern.
- Admin lives under `src/pages/admin/*` behind an auth guard — one screen per editable area.
- Reusable CSS classes and design tokens over repeated inline style objects.
- Respect the current app-level split:
  - `useAuth` for admin session + sign-in / sign-out
  - `useAdminAccess` for active-owner authorization
  - `src/services/supabase/content.ts` for the current Hero content contract
  - future `useContent` / `useImageUpload` hooks only once reuse or image upload complexity justifies them
- Small, composable React components with clear prop contracts and strict TypeScript.
- Accessibility on every interactive change: labels, focus states, button semantics, readable copy.

## Repo Conventions

- `src/App.tsx` is a thin composition root — keep it thin.
- `src/sections/*` — each public section is self-contained. Current data loading happens in `src/pages/index.tsx` and services; extract a shared `useContent` hook only when more editable sections exist.
- `src/pages/index.tsx` — composes all sections in order for the public one-pager.
- `src/pages/admin/*` — protected screens. The auth guard lives in a layout component.
- `src/services/supabase/*` — Supabase client, content fetchers, auth helpers, Storage helpers.
- `src/services/contact.ts` — calls the `submit-contact` Edge Function (never calls WhatsApp directly).
- `src/types/index.ts` — strict shared contracts (Section content shapes, FormSubmission, etc.).
- `src/utils/` — small cross-cutting helpers (phone formatting, locale-aware date helpers).
- `src/App.css` + `src/index.css` — shared design tokens and component classes. Extend them before duplicating styles per section.

## Guardrails

- **Never** call the WhatsApp API directly from the browser — always go through the Edge Function.
- **Never** store the Supabase service-role key in the frontend; only the anon key is allowed.
- Do not bypass the existing service/hook structure by inlining auth, content-fetch, or contact-function logic directly into section JSX.
- Do not add dependencies unless the task clearly requires it — prefer native browser APIs.
- Do not redesign away from the established visual direction without updating tokens and `rules/design.md`.
- Avoid premature abstraction. Extract a hook/component only after the pattern appears at least twice or readability clearly improves.
- Do not add features that would push the project off Supabase or hosting free tiers.

## Default Workflow

1. Read the touched section/page/component and its matching styles.
2. Check whether the same pattern already exists elsewhere in the app.
3. Check whether the change touches Supabase reads/writes, Storage, the contact form, or admin auth.
4. Implement the smallest clean change that improves structure and UX together.
5. Verify on **mobile width first**, then desktop.
6. Run `npm run lint` and `npm run build` from `/app`.

## Output Style

When making changes, explain them in terms of:

- visitor- or owner-facing outcome
- architectural fit with this repo (which folder, which hook, which contract)
- any follow-up debt that still exists
