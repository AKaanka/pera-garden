# Pera Garden App

Vite + React + TypeScript frontend for the Pera Garden public one-pager and owner admin panel.

## Environment

Create `app/.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_SITE_URL=https://your-domain.example
VITE_SOCIAL_IMAGE_URL=/favicon.svg
```

Only public browser-safe values belong here. `VITE_SITE_URL` is used for canonical and social sharing URLs in production. `VITE_SOCIAL_IMAGE_URL` controls the image used for Open Graph/Twitter previews and can be absolute or root-relative. The Supabase service-role key must never be exposed to the frontend.

Do not run `supabase login`, `supabase link`, migrations, or function deploys against an account until the target Supabase project is confirmed. This computer may have another Supabase account configured.

The target project is currently documented in `../docs/SETUP.md`.

## Admin Setup

MVP admin auth is email + password. Create the owner manually in Supabase Auth, then run `../supabase/manual_launch_update.sql` in Supabase SQL Editor.

For only the admin promotion step:

```sql
insert into public.profiles (id, email, is_active)
select id, email, true
from auth.users
order by created_at asc
limit 1
on conflict (id) do update
set
  email = excluded.email,
  is_active = true,
  updated_at = now();
```

Supabase's built-in email sender has strict development-oriented limits. Use email + password for MVP login, and add custom SMTP before relying on magic links in production.

## Local Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run generate:sitemap
npm run verify:seo
```

## SEO Output

Set `VITE_SITE_URL` to the final production origin before building. When it is set,
`npm run build` writes `dist/sitemap.xml` and adds the matching `Sitemap:` line to
`dist/robots.txt`. It also injects static canonical, `og:url`, `og:image`, and
`twitter:image` tags plus `WebSite` and `EventVenue` JSON-LD into
`dist/index.html`. Set `VITE_SOCIAL_IMAGE_URL` to a real venue preview image before
launch; it falls back to `/favicon.svg` until that image is ready. If `VITE_SITE_URL`
is missing, sitemap generation and static absolute URL injection are skipped so local
and preview builds do not publish the wrong canonical domain.

The build also runs `npm run verify:seo` against `dist` to confirm the static
metadata, social image tags, structured data, admin crawl controls, and sitemap
behavior are present.

## Netlify Hosting

The app is a single-page React app. Static hosts must rewrite deep links such as `/admin`,
`/admin/reset`, and `/admin/sections/contact` back to `index.html` so the client router can
render the right screen after a refresh.

The repo root has `netlify.toml` with:

```toml
[build]
  base = "app"
  command = "npm run build"
  publish = "dist"
```

Netlify uses `public/_redirects`, which Vite copies to `dist/_redirects`, and `public/_headers` for admin `X-Robots-Tag` noindex headers.
