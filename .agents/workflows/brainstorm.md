---
description: Repo-specific product and UX ideation workflow for Pera Garden
---

# Pera Garden Brainstorm Workflow

## 1. Start From The Product Reality

- Pera Garden is a **mobile-first marketing one-pager** for a wedding venue.
- The two primary users are:
  - **Visitors** — couples evaluating the venue, mostly arriving from Instagram/Google on a phone.
  - **Owner** — non-technical, edits content via a simple admin panel and receives lead notifications on WhatsApp.
- Ideas should strengthen: emotional first impression, trust, and the path from visit → reservation inquiry.

## 2. Split Ideas By Layer

- **Product flow:** what helps a visitor decide to contact the venue faster.
- **UI layer:** which section, gallery pattern, or CTA placement communicates that clearly.
- **Data layer:** whether the idea fits the existing Supabase schema or needs a new table/field/storage bucket.

## 3. Filter Ruthlessly

- Prefer ideas that increase **inquiry conversion** (clearer CTA, better gallery, social proof).
- Avoid speculative complexity (multi-tenant, booking calendars, payments) unless explicitly scoped.
- Favor one polished section over three half-built ones.
- Stay inside free-tier limits — no idea that requires paid SaaS at MVP.

## 4. Prototype In The Current Stack

- Validate ideas in the existing Vite + React + TS app first.
- Reuse current design tokens, components, and section primitives.
- If a new concept needs backend support, note the Supabase contract (table, RLS, storage bucket, or Edge Function) without blocking the prototype.

## 5. Deliverables

Useful outputs for this repo are:

- a tightened visitor flow from hero → form submit
- updated section content model (fields the admin can edit)
- clearer component requirements
- a short list of Supabase changes if any
