# Pera Garden Roadmap

This roadmap keeps future work ordered around business value: visitor trust, inquiry conversion, and owner follow-up. It should be updated whenever scope changes.

## Phase 0 - MVP Hardening

Goal:
Make the existing Hero -> Contact -> WhatsApp -> Admin retry loop production-ready.

Work:
- Replace the temporary owner account with the real owner account.
- Set real WhatsApp and Turnstile secrets.
- Disable `ALLOW_MISSING_TURNSTILE`.
- Confirm WhatsApp template approval and real delivery.
- Add production Hero image and final Turkish copy.
- Verify the full go-live checklist in `docs/GO_LIVE_CHECKLIST.md`.

Definition of done:
- A visitor can submit an inquiry from the production site.
- The owner receives the WhatsApp notification.
- Failed WhatsApp delivery is visible and retryable in admin.
- Public users cannot read draft content or submissions.

## Phase 1 - Public Trust And Conversion

Goal:
Make the one-pager feel complete enough for couples arriving from Instagram or Google.

Recommended order:
1. Add a polished About/venue story section. Status: static section added.
2. Add Services or Packages with short, scannable copy.
3. Add a Location section with practical contact/location details.
4. Add FAQ for common friction points.
5. Add Testimonials only when real quotes are available.

Notes:
- Keep each section static first unless the owner truly needs to edit it immediately.
- Convert a section to editable `site_content` only when admin editing is needed.
- Keep the primary contact CTA visible and repeated naturally.

## Phase 2 - Image Pipeline And Gallery

Goal:
Let the owner manage venue imagery without developer help.

Work:
- Add admin image upload for Hero.
- Add image compression with `browser-image-compression`.
- Add `gallery` Storage bucket and policies.
- Add `gallery_images` table if metadata/order/captions are needed.
- Add public Gallery section.
- Add admin Gallery management screen.

Definition of done:
- Owner can upload, reorder, describe, publish, and remove gallery images.
- Public gallery remains fast on mobile.
- Storage remains within free-tier limits.

## Phase 3 - Admin Content System

Goal:
Make admin editing consistent as more sections become editable.

Work:
- Extract shared content loading/saving patterns once at least two editable sections exist.
- Introduce `useContent` only when it removes real repetition.
- Introduce reusable form fields and status messages after repeated admin forms appear.
- Add content restore/history UI only after owners have enough content to make mistakes costly.

Definition of done:
- Admin screens feel consistent.
- Section content contracts are typed.
- Publish behavior remains explicit and safe.

## Phase 4 - Localization And Polish

Goal:
Support Turkish-first production while keeping English available when useful.

Work:
- Add a language switcher only after the English content is production-ready.
- Localize public form labels and validation messages.
- Standardize date/time display for admin submissions.
- Improve metadata and Open Graph content per locale if needed.

Definition of done:
- Turkish flow is polished end to end.
- English does not appear half-finished.
- Admin copy stays direct and operational.

## Phase 5 - Measurement And Operations

Goal:
Understand whether the site is generating inquiries without adding unnecessary complexity.

Work:
- Start with Supabase submission counts and manual owner feedback.
- Add privacy-friendly analytics only if the owner needs traffic/source insight.
- Add export or archive tools only when submission volume justifies them.
- Monitor Supabase Storage, database size, and Edge Function usage.

Definition of done:
- Owner can answer "Are we getting useful inquiries?" without paid tooling.
- Operational checks stay light enough to maintain.

## Backlog / Revisit Later

- Booking calendar.
- Payments or deposits.
- Multi-owner roles.
- Magic link auth with custom SMTP.
- Advanced analytics.
- CRM integrations.
- Automated email follow-up.

These are not wrong ideas. They are intentionally deferred until the core inquiry loop and public trust sections are working in production.
