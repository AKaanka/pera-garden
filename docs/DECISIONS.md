# Pera Garden Decision Log

This file records architecture and product decisions that future contributors should preserve unless there is a clear reason to revisit them.

## ADR-001 - Stay On Free-Tier Services

Status: accepted

Decision:
Use free-tier friendly services for the MVP: static frontend hosting, Supabase Auth/Postgres/Storage/Edge Functions, Meta WhatsApp Cloud API, and Cloudflare Turnstile.

Why:
The project is for a small wedding venue site and owner admin panel. The MVP should prove the visitor-to-inquiry flow without adding fixed monthly cost.

Consequences:
- Avoid paid SaaS, queues, hosted Redis, analytics platforms, or media services unless explicitly approved.
- Prefer Supabase-native features before introducing new infrastructure.
- Recheck free-tier impact before adding image-heavy, analytics-heavy, or automation-heavy features.

## ADR-002 - Keep One Frontend App

Status: accepted

Decision:
Keep the public site and owner admin panel inside one Vite + React + TypeScript app under `app/`.

Why:
The admin panel is small, protected by Supabase Auth, and shares types, tokens, services, and deployment with the public site.

Consequences:
- Do not split the admin panel into a separate app for the MVP.
- Keep `src/App.tsx` thin as routing grows.
- Put admin screens under `src/pages/admin/` and public sections under `src/sections/`.

## ADR-003 - Supabase Is The Backend Source Of Truth

Status: accepted

Decision:
Use Supabase for Postgres schema, Row Level Security, Auth, Storage, and Edge Functions.

Why:
It covers the required MVP backend surfaces while keeping operations small and free-tier friendly.

Consequences:
- Schema changes belong in `supabase/migrations/`.
- RLS and helper functions are part of the product contract, not optional hardening.
- Frontend data access should go through `app/src/services/` or hooks, not scattered component queries.

## ADR-004 - Owner Auth Uses Email And Password For MVP

Status: accepted

Decision:
Use Supabase email/password sign-in for the owner admin account. Public sign-up is not exposed.

Why:
Supabase's built-in email sender is development-oriented and production magic links should wait for custom SMTP. Password login avoids consuming email link quota on every owner login.

Consequences:
- Create the owner manually in Supabase Auth.
- Promote the owner through `supabase/seed.sql` or equivalent SQL.
- Revisit magic links only after production email delivery is configured.

## ADR-005 - Admin Access Is Active Profile Based

Status: accepted

Decision:
For MVP, a user is an admin when `profiles.id = auth.uid()` and `profiles.is_active = true`.

Why:
The project currently needs one owner/admin, not role hierarchies.

Consequences:
- Keep `app_private.is_admin()` as the single RLS helper for admin checks.
- Do not add a `role` column until a real second role appears.
- If roles are added later, migrate the database helper first, then update policies and UI.

## ADR-006 - Editable Site Content Uses Locale-First JSONB

Status: accepted

Decision:
Store editable section content in `site_content.content` as JSONB with both `tr` and `en` keys.

Why:
The admin panel needs flexible content editing without a migration for every copy or layout field.

Consequences:
- Update TypeScript content contracts before changing section JSON shape.
- Keep published public reads scoped to published content only.
- Add new `section_key` values incrementally as sections become editable.

## ADR-007 - Contact Submission Runs Through Edge Functions

Status: accepted

Decision:
The browser calls the `submit-contact` Edge Function. The frontend never inserts public submissions directly and never calls WhatsApp directly.

Why:
The flow needs validation, rate limiting, service-role insert, Turnstile verification, and WhatsApp secrets that must stay server-side.

Consequences:
- Keep WhatsApp token, owner phone, service-role key, and Turnstile secret out of Vite env vars.
- Treat the Edge Function request/response shape as the public contract.
- Admin retry goes through the authenticated `retry-whatsapp` Edge Function.

## ADR-008 - Rate Limiting Uses Postgres For MVP

Status: accepted

Decision:
Use the `contact_rate_limits` Postgres table for IP and normalized-phone rate limits.

Why:
It avoids adding Redis or another paid/external service while still protecting the anonymous contact endpoint.

Consequences:
- Keep cleanup lightweight and inline until volume proves otherwise.
- Hash rate-limit keys with `RATE_LIMIT_PEPPER`.
- Revisit only if traffic or abuse exceeds Supabase free-tier comfort.

## ADR-009 - Be Careful With Supabase CLI Account State

Status: accepted

Decision:
Do not run `supabase login`, `supabase link`, migrations, or deploys from this machine until the active Supabase account and target project are confirmed.

Why:
This machine may already be configured for another Supabase account.

Consequences:
- Prefer the dashboard or explicitly confirmed MCP/CLI state for production actions.
- Keep target project details in `docs/SUPABASE_SETUP.md`.
- Treat deploy commands as production-sensitive operations.

## ADR-010 - MVP Vertical Slice Comes Before V1 Breadth

Status: accepted

Decision:
Finish and harden the Hero -> Contact -> WhatsApp -> Admin retry loop before adding gallery management, services, pricing, testimonials, FAQ, analytics, booking, or language switching UI.

Why:
The core business value is inquiry conversion and owner follow-up. More sections are useful only after the core loop is stable.

Consequences:
- New feature ideas should be labeled MVP-critical, V1, or backlog.
- Favor one polished section or workflow over several partial features.
- Use `.agents/tasks/feature.md` before starting broad new product work.
