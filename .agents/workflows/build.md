---
description: Implementation workflow for Pera Garden
---

# Pera Garden — Build Workflow

## 1. Understand The Current Slice

- Read the relevant section/page, its types, and the related Supabase table or function before changing anything.
- Baseline stack: Vite + React + TypeScript + Supabase. Do not introduce new frameworks.
- Assume free-tier constraints — no paid services unless explicitly approved.

## 2. Keep The Architecture Honest

- Match changes to the existing structure (`sections/`, `components/`, `pages/admin/`, `hooks/`, `services/`, `types/`).
- Improve existing files before creating new layers.
- Extract a hook or helper only when it reduces real repetition.

## 3. Build In Small Vertical Steps

1. Update `src/types/` first when contracts change.
2. Update or add the Supabase migration / RLS / Edge Function if backend is involved.
3. Update the service layer in `src/services/`.
4. Update the section or admin page component.
5. Finish with copy, accessibility, responsive checks, and shared styles.

## 4. Verify

- Run `npm run lint` in `/app`.
- Run `npm run build` in `/app`.
- Manually verify the change on **mobile width first**, then desktop.
- For admin changes: verify both authenticated and unauthenticated states.
- For form changes: submit a real test entry and confirm the WhatsApp message arrives.
- If a check cannot run locally, document the blocker.

## 5. Decision Rule

Choose the smallest change that makes the next contribution easier — and that keeps Pera Garden inside free tiers.
