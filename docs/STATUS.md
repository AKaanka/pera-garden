# Pera Garden — Go-Live Status

Single source of truth for production readiness. Last updated: 2026-06-09.

## Snapshot

- Local `npm run lint` passes.
- Local `npm run build` passes.
- Public contact form has been removed for launch.
- Contact section now uses direct editable actions: Instagram, phone, WhatsApp, and Google Maps.
- Hosting target changed to Netlify.
- Root `netlify.toml` exists and points Netlify to `app/`, `npm run build`, and `dist`.
- `app/public/_redirects` supports SPA deep links like `/admin`.
- `app/public/_headers` adds noindex headers for `/admin`.
- `supabase/manual_launch_update.sql` exists for owner promotion and launch copy alignment.

## 1. Ownership

- [x] Owner email chosen: `peragarden78@gmail.com`
- [ ] Owner Auth user created in Supabase
- [ ] Owner promoted in `public.profiles`
- [ ] Other temporary admin profiles disabled
- [ ] Admin login verified at `/admin`
- [ ] Stronger password set before public launch
- [ ] Supabase leaked-password protection enabled if available

## 2. Supabase Data

- [x] MVP and pre-Gallery editable-section migrations applied to target
- [ ] Pending migrations applied for section visibility, Gallery, Chrome/Header/Footer, and Contact
- [ ] `supabase/manual_launch_update.sql` run in SQL Editor
- [ ] `supabase/verify_compact.sql` passes
- [ ] `supabase/verify_access.sql` passes
- [ ] Gallery bucket exists and supports production image/video uploads
- [ ] Real contact links published through `/admin/sections/chrome`

## 3. Netlify

- [x] `netlify.toml` added
- [x] SPA redirect file exists: `app/public/_redirects`
- [x] Admin noindex headers exist: `app/public/_headers`
- [ ] Netlify site connected to repo
- [ ] Netlify env vars set
- [ ] Netlify deploy succeeds
- [ ] Custom domain connected, if used
- [ ] HTTPS verified

Netlify env vars:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SITE_URL
VITE_SOCIAL_IMAGE_URL
```

## 4. Auth Redirects

- [ ] `http://localhost:5173/admin/reset` added in Supabase Auth redirects
- [ ] Netlify preview reset URL added, if needed
- [ ] Production domain reset URL added

Examples:

```text
https://your-netlify-site.netlify.app/admin/reset
https://your-domain.example/admin/reset
```

## 5. Frontend Verification

- [x] Local build passes
- [x] Contact section has no form on desktop
- [x] Contact section has no form on mobile
- [x] Contact section has no horizontal overflow on mobile
- [ ] Homepage verified on deployed Netlify URL
- [ ] `/admin` verified on deployed Netlify URL
- [ ] `/admin/sections` verified on deployed Netlify URL
- [ ] Header/footer direct contact buttons verified
- [ ] Final production images loaded and cropped correctly
- [ ] Turkish public copy reviewed
- [ ] English public copy reviewed or hidden until ready

## 6. SEO

- [x] Build-time SEO verification runs in `npm run build`
- [ ] `VITE_SITE_URL` set to final production origin
- [ ] `VITE_SOCIAL_IMAGE_URL` set to real venue preview image
- [ ] `sitemap.xml` generated in production build
- [ ] Admin pages return noindex headers on Netlify
- [ ] Public title/description/social preview checked after deploy

## Recommended Next Actions

1. Run pending Supabase migrations or confirm target already has them.
2. Run `supabase/manual_launch_update.sql`.
3. Verify admin login locally.
4. Publish real contact links in `/admin/sections/chrome`.
5. Create Netlify site and set env vars.
6. Deploy and verify homepage, `/admin`, and direct contact buttons.
