# Pera Garden App

Vite + React + TypeScript frontend for the Pera Garden public one-pager and owner admin panel.

## Environment

Create `app/.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

Only public browser-safe values belong here. The service-role key, WhatsApp token, owner phone, and Turnstile secret live in Supabase Edge Function secrets.

Do not run `supabase login`, `supabase link`, migrations, or function deploys against an account until the target Supabase project is confirmed. This computer may have another Supabase account configured.

The target project is currently documented in `../docs/SETUP.md`.

## Admin Setup

MVP admin auth is email + password. Create the owner manually in Supabase Auth, then run:

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
```

## Static Hosting

The app is a single-page React app. Static hosts must rewrite deep links such as `/admin`,
`/admin/reset`, and `/admin/sections/contact` back to `index.html` so the client router can
render the right screen after a refresh.

- Netlify and Cloudflare Pages use `public/_redirects`, which Vite copies to `dist/_redirects`.
- Vercel uses `vercel.json` from the `app/` deploy root.
