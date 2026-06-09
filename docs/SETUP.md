# Pera Garden — Setup & Deploy Runbook

Operational runbook for the current launch path. Canonical SQL lives in `supabase/migrations/` and `supabase/manual_launch_update.sql`.

## Current Launch Shape

- Frontend: Vite + React + TypeScript in `app/`
- Hosting: Netlify, configured by root `netlify.toml`
- Backend: Supabase Auth, Postgres/RLS, Storage
- Admin: email/password owner login, allowed by `public.profiles.is_active = true`
- Public contact: direct editable links for Instagram, phone, WhatsApp, and Google Maps
- Public contact form / WhatsApp Business automation: disabled for launch

## Setup Steps

| # | Step | Status | How |
|---|------|--------|-----|
| 1 | MVP migration | done | SQL Editor -> run `supabase/migrations/20260528204211_mvp_vertical_slice.sql`, then `supabase/verify.sql` |
| 2 | Editable sections | target partial | Apply pending migrations for visibility, gallery, chrome, and contact, then run `supabase/verify_compact.sql` and `supabase/verify_access.sql` |
| 3 | Owner user | manual | Supabase Dashboard -> Authentication -> Users -> create `peragarden78@gmail.com`, password set by owner, auto-confirm enabled |
| 4 | Launch SQL | manual | Run `supabase/manual_launch_update.sql` in SQL Editor to promote owner and align live copy |
| 5 | Netlify env | pending | Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_SOCIAL_IMAGE_URL` |
| 6 | Auth redirects | pending | Add local and production `/admin/reset` URLs in Supabase Auth settings |
| 7 | Build verify | local passing | `cd app && npm run lint && npm run build` |
| 8 | Deploy verify | pending | Verify homepage, `/admin`, direct contact buttons, images, and mobile layout on Netlify |

Expected target schema after all migrations: `profiles`, `site_content`, `submissions`, `contact_rate_limits`, and `whatsapp_delivery_attempts` exist; RLS is enabled; `hero` and `gallery` buckets exist; `site_content` supports `chrome`, `hero`, `about`, `services`, `gallery`, `slider`, `location`, `faq`, `contact`, and `custom_*`; `site_content.is_visible` controls homepage visibility.

## Netlify

Root `netlify.toml`:

```toml
[build]
  base = "app"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

Netlify uses `app/public/_redirects` for SPA fallback:

```text
/* /index.html 200
```

Netlify uses `app/public/_headers` to prevent admin indexing:

```text
/admin
  X-Robots-Tag: noindex, nofollow, noarchive

/admin/*
  X-Robots-Tag: noindex, nofollow, noarchive
```

## Environment

Frontend / Netlify environment variables:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_SITE_URL=https://your-final-domain.example
VITE_SOCIAL_IMAGE_URL=/favicon.svg
```

Only browser-safe values belong in Vite env. Never expose the Supabase service-role key in Netlify frontend variables.

`VITE_SITE_URL` should be the final HTTPS origin without a trailing slash. It is used for canonical URLs, social URLs, JSON-LD, sitemap generation, and the `Sitemap:` line in `robots.txt`.

`VITE_SOCIAL_IMAGE_URL` should point to the final social preview image before launch. It can be absolute or root-relative.

## Auth Redirects

Add allowed redirect URLs in Supabase Auth settings:

```text
http://localhost:5173/admin/reset
https://your-netlify-site.netlify.app/admin/reset
https://your-domain.example/admin/reset
```

If local Vite uses another port, add that exact local URL too.

## Content Shape

`site_content.content` is always:

```json
{ "tr": {}, "en": {} }
```

It may also include a top-level `background` field. Valid values are `paper`, `beige`, and `tan`.

Chrome (`section_key = 'chrome'`) controls fixed header/footer copy plus direct-contact actions: `brandLabel`, `logo`, `navItems`, `ctaLabel`, `ctaHref`, `instagramLabel`, `instagramHref`, `phoneLabel`, `phoneHref`, `whatsappLabel`, `whatsappHref`, `mapLabel`, `mapHref`, `footerText`, `footerLinkLabel`, `footerLinkHref`.

Contact (`section_key = 'contact'`) now controls only section copy shown above the direct contact actions. The public form has been removed for launch.

## Manual Supabase Update

After creating the owner Auth user, run:

```text
supabase/manual_launch_update.sql
```

It promotes `peragarden78@gmail.com`, deactivates other admin profiles for the MVP single-owner setup, updates live `Rezervasyon` wording to `İletişim`, and backfills About `experienceTitle`.

## Verification

Local:

```bash
cd app
npm run lint
npm run build
```

Supabase:

```sql
select email, is_active from public.profiles order by updated_at desc;
select section_key, status, is_visible from public.site_content order by order_index, section_key, status;
```

Netlify after deploy:

- Homepage loads on mobile and desktop
- `/admin` and `/admin/sections` load after refresh
- Admin login works for the real owner
- Direct contact buttons open the correct Instagram, phone, WhatsApp, and Google Maps targets
- Admin pages return `X-Robots-Tag: noindex, nofollow, noarchive`
- `dist/sitemap.xml` exists when `VITE_SITE_URL` is set
