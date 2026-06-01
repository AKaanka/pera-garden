# Pera Garden Phase 0 Audit

Date: 2026-06-01

Purpose:
Audit the current MVP hardening state before production work continues.

## Summary

Local code readiness is good. The frontend TypeScript check and production build pass after repairing local native dependencies in `node_modules`.

Hosted production readiness is still blocked by Supabase/Meta configuration work that must be verified through the Supabase dashboard, Supabase MCP/CLI with a freshly rotated token, and Meta WhatsApp configuration.

Important security note:
An `sbp_...` Supabase token was shared in chat. Treat it as compromised. Do not use it for project work. Rotate/revoke it in Supabase before granting any new automated access.

## Verified Locally

- `npm run lint` passes from `app/`.
- `npm run build` passes from `app/`.
- `app/.env.local` exists locally with only browser-safe Vite variable names:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_TURNSTILE_SITE_KEY`
- Repository scan did not find the shared `sbp_` token committed to project files.
- No service-role key, WhatsApp token, Turnstile secret, or rate-limit pepper is committed in project files.
- Git working tree is clean after the local dependency repair.

## Local Environment Repair Performed

The first production build failed because macOS blocked native Rollup/esbuild binaries under `app/node_modules`.

Actions taken:
- Removed `com.apple.quarantine` from the local Rollup native binary.
- Removed `com.apple.quarantine` from local esbuild files.
- Ran `npm rebuild esbuild` with network access to restore the missing `@esbuild/darwin-arm64` binary.

This changed only ignored local dependency files. No committed source files or lockfiles changed.

## Still Blocked / Not Verified

These items need dashboard, MCP, or CLI access after token rotation:

- Real owner Supabase Auth user exists.
- Temporary owner account is removed, disabled, or clearly marked non-production.
- Real owner profile is promoted with `is_active = true`.
- `ALLOW_MISSING_TURNSTILE` is removed or set to `false`.
- Real `TURNSTILE_SECRET` is set in Edge Function secrets.
- Real WhatsApp secrets are set:
  - `WHATSAPP_TOKEN`
  - `WHATSAPP_PHONE_ID`
  - `OWNER_PHONE`
- `RATE_LIMIT_PEPPER` is set and known only as a secret.
- `supabase/verify.sql` or `supabase/verify_compact.sql` passes against the target project.
- Public anon can read published Hero content and cannot read draft Hero content.
- Public anon cannot read submissions.
- Authenticated admin can read submissions.
- `submit-contact` rejects missing/invalid Turnstile in production mode.
- A real contact submission creates a `submissions` row.
- WhatsApp template is approved in Meta.
- Owner receives a real WhatsApp message.
- Failed WhatsApp delivery remains retryable from admin.

## Product / Content Blockers

- Production Hero image is still not confirmed.
- Final Turkish public copy is still not confirmed.
- Public homepage has only Hero and ContactForm, which is acceptable for MVP but thin for real conversion.
- Contact form labels are currently English while surrounding section copy is Turkish. This should be localized before launch.

## Recommended Next Actions

1. Revoke/rotate the shared Supabase token.
2. Confirm the safe access method for hosted Supabase work: dashboard, MCP, or CLI with a new token.
3. Replace temporary owner access with the real owner account.
4. Set real Turnstile and WhatsApp secrets.
5. Disable `ALLOW_MISSING_TURNSTILE`.
6. Run `supabase/verify_compact.sql` against the target project.
7. Test one real production-style contact submission.
8. Localize the visible contact form labels and success/error copy to Turkish before launch.
