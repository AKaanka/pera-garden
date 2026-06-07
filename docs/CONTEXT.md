# Pera Garden — Agent Context (load every turn)

Invariants and live state. Keep this small. Detailed runbooks live in other docs; load them only when a task needs them.

## What this is

Wedding-venue one-pager + owner admin panel. One Vite + React + TS app in `app/` (public site + `/admin`). Backend = Supabase (Postgres, Auth, RLS, Storage, Edge Functions). Notifications = Meta WhatsApp Cloud API. Bot protection = Cloudflare Turnstile.

## Core loop (MVP)

Owner edits Hero draft in `/admin` → publishes → visitor sees it → visitor submits contact form → `submit-contact` validates, rate-limits, inserts to `submissions` (service-role), sends WhatsApp → owner retries failed delivery from admin.

## Hard invariants (never violate)

- **Secrets never in Vite env.** Only `VITE_*` browser-safe vars in `app/.env.local`. Service-role / WhatsApp / Turnstile / pepper are Edge Function secrets only.
- **Contact path is Edge-Function-only.** Frontend never inserts `submissions` and never calls WhatsApp directly.
- **Admin = `profiles.id = auth.uid()` AND `profiles.is_active = true`.** Enforced by `app_private.is_admin()`. No `role` column until a real second role exists.
- **Free-tier only.** No paid SaaS, Redis, queues, or media services without explicit approval. Prefer Supabase-native.
- **Anon can only SELECT published `site_content`.** Never draft, never submissions.
- **Schema changes go in `supabase/migrations/`.** Data access via `app/src/services/` or hooks, not scattered queries.
- **CLI caution:** this machine may be logged into another Supabase account. Don't `login`/`link`/migrate/deploy until the active account + target project are confirmed. Prefer dashboard or confirmed MCP.

## Target project

- Ref: `xaxlsqddnoblcgdqlrmh` · URL: `https://xaxlsqddnoblcgdqlrmh.supabase.co` · Region: EU/Frankfurt

## Live state (as of 2026-06-07)

- ✅ Local `lint` + `build` pass; dev server renders the public homepage cleanly.
- ✅ Post-MVP work is committed on branch `feat/editable-sections-and-go-live-prep` (seven themed commits) and passed a pre-merge review with no P0/P1 findings. Not yet merged to `main` or applied to target.
- ✅ Target has MVP + pre-Gallery editable-section + security-cleanup migrations applied. RLS on all target tables. Hero/About/Services/Slider/Location/FAQ are editable + orderable via `/admin/sections`.
- ⚠️ Local code/migrations also support Gallery photo/video management, whole-section Hide/Show, admin-created `custom_*` sections, desktop-arrow/mobile-swipe gallery viewing, editable Chrome/Header/Footer, editable direct-contact actions (Instagram/phone/WhatsApp/Google Maps), editable Contact/Rezervasyon copy and labels, and locale-aware contact-form verification states. These newer migrations are pending target application until the active Supabase account/project is confirmed.
- ✅ Local verification scripts now expect the full built-in section set through Contact, check Chrome direct-contact fields and Contact form-copy fields, and require admin access to at least 18 section rows after the full local migration set is applied. Chrome/Contact migrations backfill missing JSON keys without overwriting owner-edited values.
- ✅ Both Edge Functions deployed. `RATE_LIMIT_PEPPER` set.
- ⚠️ **Blocked for production:** rotate the leaked `sbp_` token; replace temp owner with real owner; set real WhatsApp + Turnstile secrets; set `ALLOW_MISSING_TURNSTILE=false`; get WhatsApp template approved + confirm real delivery; add production Hero image.

## Pointers (load on demand)

- Setup / deploy steps → `SETUP.md`
- Architecture decisions → `DECISIONS.md`
- Go-live state + verification → `STATUS.md`
- Build contract details (function I/O, content shape, pipeline) → `SETUP.md` §Contracts
- Roadmap → `ROADMAP.md`
- Canonical SQL → `supabase/seed.sql`, `supabase/migrations/`, `supabase/verify_compact.sql`
- WhatsApp template + secrets template → `SETUP.md` §5, `supabase/functions/.env.example`
