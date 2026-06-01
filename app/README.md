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

The target project is currently documented in `../docs/SUPABASE_SETUP.md`.

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
