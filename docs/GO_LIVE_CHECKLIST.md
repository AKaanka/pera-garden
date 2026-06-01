# Pera Garden Go-Live Checklist

Use this before treating the MVP as production-ready. A checked item should mean it has been verified against the target Supabase project and the deployed frontend, not only configured locally.

## 1. Ownership And Access

- [ ] Real owner Supabase Auth user is created.
- [ ] Temporary testing owner is removed, disabled, or clearly marked non-production.
- [ ] Real owner is promoted in `public.profiles` with `is_active = true`.
- [ ] Public sign-up remains unavailable from the frontend.
- [ ] Admin login works at `/admin`.
- [ ] Non-admin authenticated access is rejected.

## 2. Secrets And Environment

- [ ] `app/.env.local` or hosting env contains only browser-safe Vite variables.
- [ ] Frontend has `VITE_SUPABASE_URL`.
- [ ] Frontend has `VITE_SUPABASE_ANON_KEY`.
- [ ] Frontend has `VITE_TURNSTILE_SITE_KEY`.
- [ ] Edge Functions have `SUPABASE_URL`.
- [ ] Edge Functions have `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Edge Functions have `WHATSAPP_TOKEN`.
- [ ] Edge Functions have `WHATSAPP_PHONE_ID`.
- [ ] Edge Functions have `OWNER_PHONE`.
- [ ] Edge Functions have `TURNSTILE_SECRET`.
- [ ] Edge Functions have `RATE_LIMIT_PEPPER`.
- [ ] `ALLOW_MISSING_TURNSTILE` is removed or set to `false` before production.

## 3. Supabase Data And Security

- [ ] MVP migration is applied to the target project.
- [ ] `supabase/verify.sql` or `supabase/verify_compact.sql` passes.
- [ ] Public anon read can fetch published Hero content.
- [ ] Public anon read cannot fetch draft Hero content.
- [ ] Public anon cannot read submissions.
- [ ] Authenticated admin can read submissions.
- [ ] Hero Storage bucket exists and is public-read.
- [ ] Hero Storage writes require active admin access.

## 4. Edge Functions

- [ ] `submit-contact` is deployed with `verify_jwt = false`.
- [ ] `retry-whatsapp` is deployed with `verify_jwt = true`.
- [ ] `submit-contact` returns validation errors for invalid input.
- [ ] `submit-contact` rejects requests without valid Turnstile when production Turnstile is enabled.
- [ ] `submit-contact` stores a valid submission row.
- [ ] Rate limiting works for repeated IP or phone attempts.
- [ ] WhatsApp template is approved in Meta.
- [ ] Owner phone can receive the WhatsApp template.
- [ ] WhatsApp failure path records a failed attempt and leaves retry available.
- [ ] Admin retry sends or records a new failed attempt.

## 5. Frontend Build And UX

- [ ] `npm run lint` passes from `app/`.
- [ ] `npm run build` passes from `app/`.
- [ ] Public homepage loads on mobile.
- [ ] Public homepage loads on desktop.
- [ ] Hero copy, CTA, and image are production-ready.
- [ ] Contact form labels, errors, success state, and disabled state are clear.
- [ ] Admin Hero editor can save draft.
- [ ] Admin Hero editor can publish.
- [ ] Published Hero appears on the public homepage.
- [ ] Admin submissions list loads.
- [ ] Failed WhatsApp submissions show retry action.

## 6. Hosting And Domain

- [ ] Production host is selected.
- [ ] Production env vars are set in the host.
- [ ] HTTPS works.
- [ ] Custom domain works, if used.
- [ ] Open Graph title and description are correct.
- [ ] HTML language and visible copy match the production default locale.
- [ ] 404/deep link behavior for `/admin` works on the static host.

## 7. Post-Launch Watch

- [ ] Submit one real production test inquiry.
- [ ] Confirm row appears in `submissions`.
- [ ] Confirm owner receives WhatsApp.
- [ ] Confirm Supabase usage remains within free tier.
- [ ] Confirm no secret values appear in browser devtools, logs, or repository files.
- [ ] Record any launch issues in this checklist or a follow-up task brief.
