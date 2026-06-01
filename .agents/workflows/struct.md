---
description: Structural guidance for evolving the Pera Garden frontend without overengineering
---

# Pera Garden — Structure Workflow

## Current Baseline

The active app lives in `/app` and is a Vite + React + TypeScript frontend backed by Supabase (Auth, Postgres, Storage, Edge Functions).

Implemented MVP folders:

- `src/sections/` — currently `Hero` and `ContactForm`
- `src/components/` — currently shared browser widgets such as `TurnstileWidget`
- `src/pages/` — top-level routes: `/` (public one-pager) and `/admin/*` (admin panel)
- `src/pages/admin/` — login, Hero editor, submissions list
- `src/hooks/` — currently `useAuth` and `useAdminAccess`
- `src/services/` — Supabase client, content fetchers, form submission helper
- `src/types/` — shared TypeScript contracts for Hero content, submissions, contact responses
- `src/index.css` + `src/App.css` — design tokens and shared styles

Target folders as the app grows:

- `src/sections/` — one file per public one-pager section: Hero, About, Gallery, Services, Pricing, Testimonials, FAQ, Location, ContactForm, Footer
- `src/components/` — reusable UI primitives such as Button, Input, Modal, ImageUploader
- `src/hooks/` — shared orchestration hooks such as `useContent` and `useImageUpload` once reuse exists
- `src/utils/` — small cross-cutting helpers such as phone formatting and locale-aware date helpers

## Structural Rules

- Keep a **single-app frontend** structure. The admin panel is just protected routes — not a separate app.
- One section = one file under `src/sections/`. The home page composes them in order.
- Extract a hook only when logic is reused across components or a component starts mixing fetching + rendering + state.
- Shared primitives belong in `src/components/`; one-off helpers stay next to their consumer until reused.
- New folders should solve an **active** problem, not a hypothetical future one.

## When To Introduce More Structure

Add a new folder or hook only when one of these is true:

- multiple pages need the same logic
- a page mixes too many responsibilities to read easily
- a group of files clearly forms one product capability (e.g. `src/features/gallery/`)

## Styling Direction

- Put tokens and layout primitives in shared CSS (`index.css`).
- Prefer semantic class names over repeated inline style objects.
- Public site and admin panel share tokens; admin may use denser components.

## Data Direction

- Supabase is the single source of truth — no mocks in production code.
- If data shapes change, update `src/types/` first, then services, then UI.
- Keep Supabase calls inside `src/services/` or `src/hooks/`, not inside section JSX.
- Form submissions go through an Edge Function (so the WhatsApp token never reaches the browser).
