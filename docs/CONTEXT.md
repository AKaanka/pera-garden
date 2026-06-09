# Pera Garden — Agent Context (load every turn)

Invariants and live state. Keep this small. Detailed runbooks live in other docs; load them only when a task needs them.

## What this is

Wedding-venue one-pager + owner admin panel. One Vite + React + TS app in `app/` (public site + `/admin`). Backend = Supabase (Postgres, Auth, RLS, Storage). Hosting target = Netlify.

## Core loop (MVP)

Owner edits sections in `/admin` → publishes → visitor sees the one-pager → visitor contacts the venue through direct Instagram, phone, WhatsApp, or Google Maps actions.

## Hard invariants (never violate)

- **Secrets never in Vite env.** Only browser-safe `VITE_*` vars in `app/.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_SOCIAL_IMAGE_URL`). Service-role keys never belong in the frontend.
- **Contact path is direct-action-only for launch.** Frontend does not collect lead form data. It renders editable links for Instagram, phone, WhatsApp, and Google Maps.
- **Admin = `profiles.id = auth.uid()` AND `profiles.is_active = true`.** Enforced by `app_private.is_admin()`. No `role` column until a real second role exists.
- **Free-tier only.** No paid SaaS, Redis, queues, or media services without explicit approval. Prefer Supabase-native.
- **Anon can only SELECT published `site_content`.** Never draft, never submissions.
- **Schema changes go in `supabase/migrations/`.** Data access via `app/src/services/` or hooks, not scattered queries.
- **CLI caution:** this machine may be logged into another Supabase account. Don't `login`/`link`/migrate/deploy until the active account + target project are confirmed. Prefer dashboard or confirmed MCP.

## Target project

- Ref: `xaxlsqddnoblcgdqlrmh` · URL: `https://xaxlsqddnoblcgdqlrmh.supabase.co` · Region: EU/Frankfurt

## Live state (as of 2026-06-08)

- ✅ Local `lint` + `build` pass; dev server renders the public homepage cleanly.
- ✅ SEO infrastructure is local-complete: route SEO helper, public JSON-LD, configurable social preview image, static production canonical/social URL and JSON-LD injection, admin `noindex`, static `robots.txt`, `_headers`, Netlify `_redirects`, build-time sitemap generation when `VITE_SITE_URL` is set, and `verify-seo` as part of `npm run build`.
- ✅ Post-MVP work is committed on branch `feat/editable-sections-and-go-live-prep` (seven themed commits) and passed a pre-merge review with no P0/P1 findings. Not yet merged to `main` or applied to target.
- ✅ Gallery renders a placeholder section with `#gallery` anchor when empty, so nav links always resolve. Location "Yol tarifi al" button opens Google Maps in a new tab. Per-section background color is selectable from 3 warm presets in the admin panel (stored as `content.background` in JSONB). Footer shows "Safranbolu" next to the phone number.
- ✅ Target has MVP + pre-Gallery editable-section + security-cleanup migrations applied. RLS on all target tables. Hero/About/Services/Slider/Location/FAQ are editable + orderable via `/admin/sections`.
- ⚠️ Local code/migrations also support Gallery photo/video management, whole-section Hide/Show, admin-created `custom_*` sections, desktop-arrow/mobile-swipe gallery viewing, editable Chrome/Header/Footer, editable direct-contact actions (Instagram/phone/WhatsApp/Google Maps), and editable Contact/İletişim copy. These newer migrations are pending target application until the active Supabase account/project is confirmed.
- ✅ Local verification scripts now expect the full built-in section set through Contact, check Chrome direct-contact fields and Contact form-copy fields, and require admin access to at least 18 section rows after the full local migration set is applied. Chrome/Contact migrations backfill missing JSON keys without overwriting owner-edited values.
- ✅ Netlify config exists at repo root (`netlify.toml`), with `app` as build base and `dist` as publish directory.
- ⚠️ **Blocked for production:** rotate the leaked `sbp_` token; replace temp owner with real owner; apply/paste target Supabase updates including `supabase/manual_launch_update.sql`; set `VITE_SITE_URL` to the final domain; set `VITE_SOCIAL_IMAGE_URL` to a production venue preview image; add production media and real contact links.

## Pointers (load on demand)

- Setup / deploy steps → `SETUP.md`
- Architecture decisions → `DECISIONS.md`
- Go-live state + verification → `STATUS.md`
- Build contract details (function I/O, content shape, pipeline) → `SETUP.md` §Contracts
- Roadmap → `ROADMAP.md`
- Canonical SQL → `supabase/seed.sql`, `supabase/migrations/`, `supabase/verify_compact.sql`
- Manual launch SQL → `supabase/manual_launch_update.sql`
