# Pera Garden Build-Ready Spec

## MVP Scope

The MVP is one vertical slice:

1. Owner signs in to `/admin`.
2. Owner edits the Hero draft.
3. Owner publishes the Hero.
4. Visitor sees the published Hero.
5. Visitor submits the contact form.
6. `submit-contact` validates, rate limits, inserts into `submissions` with the service-role key, and sends WhatsApp.
7. Owner can retry failed WhatsApp delivery from the admin submission list.

Everything outside that loop moves to V1: gallery management UI, services/packages, pricing, testimonials, FAQ, analytics, content restore UI, language switcher UI, and booking calendar.

## Admin Auth Decision

MVP uses Supabase email + password sign-in for the owner. Public sign-up is not exposed. The first owner is created manually in Supabase Auth, then promoted with `supabase/seed.sql`.

Magic links are intentionally not the MVP default because Supabase's built-in email provider is limited and intended for development. Supabase currently documents a very low built-in email quota for email-sending Auth endpoints, and production delivery should use custom SMTP. Email + password avoids burning magic-link quota on every login. Magic link can be added later after a free/custom SMTP sender is configured.

## Admin Model

`profiles` has no `role` column in MVP. Admin access is:

- `profiles.id = auth.uid()`
- `profiles.is_active = true`

The `app_private.is_admin()` helper enforces that rule. If roles are needed later, add a `role` enum/text column in a new migration, update `is_admin()`, and add role-aware policies without changing frontend routes first.

## First Admin Seed

After creating the first Supabase Auth user:

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

The same SQL lives in `supabase/seed.sql`.

## Tables, RLS, and Storage

The exact MVP SQL is in `supabase/migrations/20260528204211_mvp_vertical_slice.sql`.

Key points:

- Anonymous users can only `SELECT` published `site_content`.
- Authenticated active admins can CRUD all MVP tables through RLS.
- The frontend never inserts into `submissions` directly.
- `submit-contact` uses the Supabase service-role key server-side to insert submissions and rate-limit rows.
- Service-role, WhatsApp, and Turnstile secrets never appear in Vite env vars.

## Locale-First Content Shape

`site_content.content` is always:

```json
{
  "tr": {},
  "en": {}
}
```

MVP Hero:

```json
{
  "tr": {
    "eyebrow": "Pera Garden",
    "title": "Dugununuz icin zamansiz bir bahce",
    "subtitle": "Sevdiklerinizle bir araya geleceginiz...",
    "primaryCtaLabel": "Rezervasyon iste",
    "primaryCtaHref": "#contact",
    "image": {
      "bucket": "hero",
      "path": "",
      "alt": "Pera Garden dugun alani"
    }
  },
  "en": {
    "eyebrow": "Pera Garden",
    "title": "A timeless garden for your wedding",
    "subtitle": "An elegant outdoor venue...",
    "primaryCtaLabel": "Request a reservation",
    "primaryCtaHref": "#contact",
    "image": {
      "bucket": "hero",
      "path": "",
      "alt": "Pera Garden wedding venue"
    }
  }
}
```

## Contact Edge Function Contract

Endpoint: `POST /functions/v1/submit-contact`

Request:

```json
{
  "firstName": "Can",
  "lastName": "Example",
  "phone": "+905551112233",
  "message": "We would like to ask about June dates.",
  "locale": "tr",
  "turnstileToken": "token-from-widget",
  "website": ""
}
```

Phone normalization uses `libphonenumber-js`, default region `TR`, and stores E.164 output in `submissions.phone_normalized`. The normalized E.164 value is also the phone rate-limit key before hashing.

Responses:

- `200 SUBMITTED`: row stored and WhatsApp sent.
- `202 WHATSAPP_QUEUED_RETRY`: row stored, WhatsApp failed, admin can retry.
- `400 VALIDATION_ERROR`: invalid field data.
- `403 TURNSTILE_FAILED`: Turnstile verification failed or is required but not configured.
- `429 RATE_LIMITED`: IP or normalized phone exceeded the current window.

Rate limit storage uses Postgres table `contact_rate_limits`; no external Redis/Upstash. Cleanup is inline in `submit-contact`: delete rate rows older than 24 hours where `blocked_until` is null or expired.

Initial limits:

- IP hash: 5 attempts per 10 minutes.
- Phone hash: 3 submissions per hour.

## WhatsApp Template Draft

Template name: `new_reservation_request`

Category: utility

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
3. Normalized phone, E.164
4. Message excerpt, max 900 chars
5. Submission timestamp in Istanbul/Berlin-friendly local format

The owner phone must be opted in to receive these operational notifications. The app sends template messages from the Edge Function only.

## Retry Failed WhatsApp

Admin UI button: `Retry WhatsApp`

Endpoint: `POST /functions/v1/retry-whatsapp`

Auth: Supabase authenticated admin JWT.

Behavior:

- Verify current user exists and has `profiles.is_active = true`.
- Load stored submission.
- Create a `whatsapp_delivery_attempts` row.
- Send the approved template again.
- Update `submissions.whatsapp_status`, attempt count, message id, and last error.

## Image Upload Pipeline

MVP implements Hero text publishing first. Actual admin image upload UI moves to V1, but the pipeline is fixed:

- Library: `browser-image-compression`
- Source max file size: 12 MB
- Stored max file size: 2 MB, enforced by Storage bucket
- Hero output: WebP, max 2400 x 1600, quality around 0.82
- Path: `hero/{yyyy}/{uuid}.webp`
- Alt text required
- Public reads allowed from `hero`; admin writes only

## Required Secrets

Frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` with the project's publishable or anon key

Edge Functions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_ID`
- `OWNER_PHONE`
- `TURNSTILE_SECRET`
- `RATE_LIMIT_PEPPER`
- optional `ALLOW_MISSING_TURNSTILE=true` for local-only testing

## Supabase Setup Status

Project selected:

- URL: `https://xaxlsqddnoblcgdqlrmh.supabase.co`
- Project ref: `xaxlsqddnoblcgdqlrmh`
- Region: Central EU / Frankfurt

Because this computer already has another Supabase account configured, use `docs/SUPABASE_SETUP.md` for dashboard-first setup unless the active CLI account is explicitly confirmed.

## Source Notes

- Supabase Auth rate limits: https://supabase.com/docs/guides/auth/rate-limits
- Supabase custom SMTP guidance: https://supabase.com/docs/guides/auth/auth-smtp
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Cloudflare Turnstile server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
