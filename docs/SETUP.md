# Pera Garden — Setup & Contracts

Operational runbook + the public contracts agents must respect. Invariants are in `CONTEXT.md`. Canonical SQL/templates live in repo files; this doc points to them rather than duplicating.

## Setup steps (current status)

| # | Step | Status | How |
|---|------|--------|-----|
| 1 | MVP migration | ✅ done | SQL Editor → run `supabase/migrations/20260528204211_mvp_vertical_slice.sql`, then `supabase/verify.sql` |
| 1.1 | Editable sections | ⚠️ target partial | Target verified through Hero/About/Services/Slider/Location/FAQ. After safe target access is confirmed, run the newer local migrations in order: `..._add_section_visibility_and_custom_sections.sql`, `..._add_gallery_section_and_media_bucket.sql`, `..._raise_gallery_bucket_video_limits.sql`, `..._add_editable_site_chrome.sql`, `..._add_editable_contact_section.sql`, then rerun `supabase/verify_compact.sql` and `supabase/verify_access.sql`. |
| 1.2 | Security advisor cleanup | ✅ done | `..._cleanup_security_advisor_warnings.sql` (explicit `search_path`; lock `rls_auto_enable`; drop broad hero listing policy). Remaining warning = dashboard leaked-password protection. |
| 2 | Create owner user | ⚠️ temp only | Auth → Users → create email+password. Keep public sign-up off. |
| 3 | Promote first user | ⚠️ temp only | Run `supabase/seed.sql` (sets `is_active = true`). |
| 4 | Edge Function secrets | ⚠️ partial | See §Secrets. Pepper set; real WhatsApp/Turnstile pending; `ALLOW_MISSING_TURNSTILE=true` temporarily. |
| 5 | WhatsApp template | ⏳ pending approval | Submit in Meta. See §WhatsApp. |
| 6 | Deploy functions | ✅ done | `supabase functions deploy submit-contact` / `retry-whatsapp --project-ref xaxlsqddnoblcgdqlrmh` |
| 7 | Verify loop | ⚠️ partial | `npm run dev` → sign in `/admin` → edit+publish Hero → submit form → check `submissions` row → confirm WhatsApp (pending creds) |

Expected after all local migrations are applied to target: `profiles`, `site_content`, `submissions`, `contact_rate_limits`, `whatsapp_delivery_attempts` exist; RLS on; `hero` bucket (10 MB limit) public-read/admin-write; `gallery` bucket (1 GB limit) public-read/admin-write; draft+published rows per editable section with `tr`/`en` keys; `section_key` accepts chrome/hero/about/services/gallery/slider/location/faq/contact and admin-created `custom_*` sections; `site_content.is_visible` controls whole-section homepage visibility; anon can select only visible published `site_content`. The Chrome and Contact migrations are idempotent for existing rows: they backfill missing JSON keys while preserving any owner-edited values already present in `site_content.content`.

## CLI / MCP
Only after confirming the active account: `supabase login` → `supabase link --project-ref xaxlsqddnoblcgdqlrmh`. Do **not** run `supabase init` (repo already has `supabase/`). MCP server added globally; if tools aren't exposed, restart Codex / run `/mcp`. Local secrets: copy `.env.secrets.example` → `.env.secrets.local` (git-ignored).

## Auth redirects
The admin login screen can request a password reset. Add allowed Auth redirect URLs for each deployed origin with the `/admin/reset` path, for example `http://localhost:5173/admin/reset` in local development and `https://your-domain/admin/reset` in production. If the dev server uses another Vite port, add that exact local URL too.

## Secrets
Frontend (`app/.env.local`, browser-safe only): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`.

Edge Functions (Project Settings → Edge Functions → Secrets): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `OWNER_PHONE`, `TURNSTILE_SECRET`, `RATE_LIMIT_PEPPER`. Dev-only: `ALLOW_MISSING_TURNSTILE=true` (remove/false for prod). Template: `supabase/functions/.env.example`.

## §5 WhatsApp template
Name `new_reservation_request` · category Utility · language `tr`. Body + variables: see `supabase/functions/.env.example` / repo template source. Variables = first name, last name, E.164 phone, message excerpt (≤900 chars), localized timestamp. Owner phone must be opted in. Templates sent from Edge Function only.

---

## §Contracts

### Content shape
`site_content.content` is always `{ "tr": {...}, "en": {...} }`. Chrome (`section_key='chrome'`) controls fixed header/footer copy plus global direct-contact actions: `brandLabel`, `navItems[] {label, href}`, `ctaLabel`, `ctaHref`, `instagramLabel`, `instagramHref`, `phoneLabel`, `phoneHref`, `whatsappLabel`, `whatsappHref`, `mapLabel`, `mapHref`, `footerText`, `footerLinkLabel`, `footerLinkHref`; its position is locked in code and it is excluded from section order. Hero keys: `eyebrow`, `title`, `subtitle`, `primaryCtaLabel`, `primaryCtaHref`, `image{bucket,path,alt}`. Services items carry `title`, `description`, `image{bucket,path,alt}`, `isPublished` and are ordered by array position; hidden services remain in admin but are filtered from the public section. Gallery items carry `id`, `type` (`photo`/`video`), `bucket`, `path`, `title`, `caption`, `alt`, `isPublished`; paths are shared by item index across locales, while text is localized. Contact (`section_key='contact'`) controls the reservation section copy and form labels: `eyebrow`, `title`, `description`, `firstNameLabel`, `lastNameLabel`, `phoneLabel`, `phoneHelp`, `messageLabel`, `submitLabel`; validation and submission still flow only through the `submit-contact` Edge Function. Public Gallery rendering now splits photos and videos into separate section views, opens media in a larger viewer, hides visible titles/captions on the public surface, and lets visitors move between items from the viewer itself with desktop arrows or mobile swipe gestures. Whole sections use `site_content.is_visible`; hidden sections stay in admin/order and are blocked from anon reads by RLS after the visibility migration. Custom sections use `custom_*` keys and localized `eyebrow`, `title`, `body`, `primaryCtaLabel`, `primaryCtaHref`; only custom sections can be removed from `/admin/sections`, with confirmation, and built-ins should use Hide instead.

Localized content blocks may also include `textStyles`, keyed by field path, for editor-controlled typography (`fontSize`, `isBold`, `isItalic`, `fontFamily`, `color`). Public rendering applies those styles to supported Hero/About/Services/Gallery/Slider/Location/FAQ/Contact/Custom/Header/Footer text fields. In local development, manual `Save draft` / `Publish` writes still fall back to browser-local content storage when the target Supabase schema is behind, so local design work is not blocked by missing migrations. The admin style UI is compact by default, supports `Reset`, and can copy a field's style to the other locale with `Copy to EN` / `Copy to TR`.

Update TS content contracts before changing JSON shape. Add built-in `section_key` values incrementally.

### `submit-contact` (`POST /functions/v1/submit-contact`, `verify_jwt=false`)
Request fields: `firstName`, `lastName`, `phone`, `message`, `locale`, `turnstileToken`, `website` (honeypot). Phone normalized via `libphonenumber-js` (region `TR`) → E.164 in `submissions.phone_normalized` (also the phone rate-limit key pre-hash).

Responses: `200 SUBMITTED` · `202 WHATSAPP_QUEUED_RETRY` · `400 VALIDATION_ERROR` · `403 TURNSTILE_FAILED` · `429 RATE_LIMITED`.

Rate limits (Postgres `contact_rate_limits`, keys hashed with `RATE_LIMIT_PEPPER`, no Redis): IP 5/10 min; phone 3/hour. Inline cleanup deletes rows >24h old where `blocked_until` null/expired.

### `retry-whatsapp` (`POST /functions/v1/retry-whatsapp`, `verify_jwt=true`)
Admin JWT. Verify `is_active`, load submission, create `whatsapp_delivery_attempts` row, resend template, update `submissions.whatsapp_status` + attempt count + message id + last error.

### Image pipeline
`browser-image-compression` · source images ≤30 MB · stored ≤10 MB (bucket-enforced for Hero) · Hero/Services/Gallery photos → WebP, max 2400px on the long edge, q≈0.94, target ≤8 MB · Gallery videos ≤1 GB and limited to MP4/MOV/WebM after `..._raise_gallery_bucket_video_limits.sql` is applied · paths `hero/{yyyy}/{uuid}.webp` and `services/{yyyy}/{uuid}.webp` in the `hero` bucket, `photos/{yyyy}/{uuid}.webp` and `videos/{yyyy}/{uuid}.{ext}` in the `gallery` bucket · alt required for photos · buckets public-read, admin-write. The Hero editor writes the storage path into both locale records; Services and Gallery items share media paths by item index and keep text localized. In local development, gallery uploads can fall back to browser-local media storage when the target Storage bucket is missing or rejects gallery media, so admin preview and public homepage rendering still work locally; this is for previewing only and production still requires the `gallery` bucket migrations.

## Sources
Supabase [auth rate limits](https://supabase.com/docs/guides/auth/rate-limits) · [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) · Cloudflare [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
