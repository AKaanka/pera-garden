# Supabase Setup Runbook

Target project:

- Project URL: `https://xaxlsqddnoblcgdqlrmh.supabase.co`
- Project ref: `xaxlsqddnoblcgdqlrmh`
- Region: Central EU / Frankfurt

This runbook avoids `supabase login` so the existing Supabase account on this computer is not changed.

## MCP Status

The Supabase MCP server has been added globally for this project:

```bash
codex mcp add supabase --url 'https://mcp.supabase.com/mcp?project_ref=xaxlsqddnoblcgdqlrmh&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage'
```

`codex mcp login supabase` completed successfully, but the current Codex session did not expose Supabase MCP tools afterward and `/mcp` or a fresh Codex session may be needed before database/function actions can be performed through MCP.

## 1. Apply The MVP Migration

Status: done through the Supabase Management API on 2026-05-28.

Recommended for now: use the Supabase Dashboard SQL Editor.

1. Open the project dashboard.
2. Go to **SQL Editor**.
3. Paste the full contents of:
   `supabase/migrations/20260528204211_mvp_vertical_slice.sql`
4. Run it once.

Expected result:

- `profiles`, `site_content`, `submissions`, `contact_rate_limits`, and `whatsapp_delivery_attempts` exist.
- RLS is enabled.
- `hero` Storage bucket exists.
- Draft and published `hero` rows exist in `site_content`.

Then run `supabase/verify.sql` in the SQL Editor. It should confirm the MVP tables, RLS state, Hero rows, Storage bucket, and policies.

Current verification result:

- MVP tables exist.
- RLS is enabled on every MVP table.
- Hero draft and published rows exist with `tr` and `en` locale keys.
- Hero Storage bucket exists with 2 MB file limit.
- 15 MVP table policies exist.

## 2. Create The Owner User

Status: a temporary owner user has been created for testing and promoted.

1. Go to **Authentication > Users**.
2. Create the owner's user manually with email + password.
3. Keep public sign-up disabled for MVP.

MVP uses email + password because Supabase's built-in email sender has development-oriented limits. Configure custom SMTP before relying on magic links in production.

## 3. Promote The First User

Status: done for the temporary owner user.

After creating the owner user, go back to **SQL Editor** and run:

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

The same SQL is stored in `supabase/seed.sql`.

## 4. Add Edge Function Secrets

Status: `RATE_LIMIT_PEPPER` is set. `ALLOW_MISSING_TURNSTILE=true` is temporarily enabled for testing. Real WhatsApp and Turnstile secrets still need values.

Set these in **Project Settings > Edge Functions > Secrets** or with CLI later:

```text
SUPABASE_URL=https://xaxlsqddnoblcgdqlrmh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_ID=...
OWNER_PHONE=...
TURNSTILE_SECRET=...
RATE_LIMIT_PEPPER=...
```

For temporary local/dev testing only:

```text
ALLOW_MISSING_TURNSTILE=true
```

Do not put any of these secret values in `app/.env.local`.

A template is available at `supabase/functions/.env.example`.

## 5. Meta WhatsApp Template

Submit this template for approval in Meta:

Name: `new_reservation_request`

Category: Utility

Language: Turkish (`tr`)

Body:

```text
Yeni Pera Garden rezervasyon talebi:

Ad Soyad: {{1}} {{2}}
Telefon: {{3}}
Mesaj: {{4}}
Tarih: {{5}}
```

Variables:

1. First name
2. Last name
3. E.164 normalized phone
4. Message excerpt
5. Localized submission timestamp

## 6. Deploy Edge Functions

Status: both functions deployed through the Supabase CLI using a per-command access token.

After the project is linked or a clean CLI profile is available:

```bash
supabase functions deploy submit-contact --project-ref xaxlsqddnoblcgdqlrmh
supabase functions deploy retry-whatsapp --project-ref xaxlsqddnoblcgdqlrmh
```

If the CLI profile problem persists, deploy through a fresh terminal session after confirming the active Supabase account is the new one.

## 7. Verify The Loop

Status: verified through the retry-ready path. Real WhatsApp delivery is still pending WhatsApp credentials.

1. Add `app/.env.local` with the project URL and publishable key.
2. Run `npm run dev` from `app/`.
3. Visit `/admin` and sign in as the owner.
4. Edit Hero and publish.
5. Open `/` and confirm the public Hero updates.
6. Submit the contact form.
7. Confirm a row appears in `submissions`.
8. Confirm the owner receives the WhatsApp message.

Before production launch, complete `docs/GO_LIVE_CHECKLIST.md`.
