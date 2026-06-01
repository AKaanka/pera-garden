# Pera Garden

Dynamic one-page wedding venue site with a protected owner admin panel and WhatsApp-notifying contact form.

## Current Status

The first MVP vertical slice is scaffolded locally:

- Vite + React + TypeScript app in `app/`
- Supabase migration and seed in `supabase/`
- Edge Function skeletons for `submit-contact` and `retry-whatsapp`
- Public Hero render
- Contact form that calls only the Edge Function
- Admin email/password login shell
- Hero draft/publish editor
- Submission list with failed-WhatsApp retry action

Supabase project status:

- MVP database migration applied and verified.
- `submit-contact` and `retry-whatsapp` Edge Functions deployed.
- Public Data API can read published Hero content.
- Public Data API cannot read draft Hero content.
- `submit-contact` smoke test returns validation errors correctly.
- Temporary owner admin user created and promoted.
- Admin login, Hero publish, public Hero render, contact submission storage, submissions list, and retry action verified.
- `ALLOW_MISSING_TURNSTILE=true` is enabled for temporary testing only.

## Target Supabase Project

- URL: `https://xaxlsqddnoblcgdqlrmh.supabase.co`
- Project ref: `xaxlsqddnoblcgdqlrmh`
- Region: Central EU / Frankfurt

This machine may have another Supabase account configured. Do not run `supabase login`, `supabase link`, migrations, or deploys until the target account/project is confirmed.

## Setup Order

1. Replace the temporary owner login with the real owner account before production.
2. Set real WhatsApp and Turnstile Edge Function secrets from `supabase/functions/.env.example`.
3. Disable `ALLOW_MISSING_TURNSTILE` before production.
4. Run the frontend from `app/` and test the full WhatsApp delivery loop.

Detailed steps live in `docs/SUPABASE_SETUP.md`.

## Project Docs

- `docs/BUILD_READY_SPEC.md` — MVP scope, contracts, and V1 boundary.
- `docs/DECISIONS.md` — accepted architecture and product decisions.
- `docs/ROADMAP.md` — recommended build sequence after the MVP slice.
- `docs/SUPABASE_SETUP.md` — target project setup and verification runbook.
- `docs/GO_LIVE_CHECKLIST.md` — production readiness checklist.

## Frontend

```bash
cd app
npm install
npm run dev
npm run lint
npm run build
```

The local app already has `app/.env.local` pointing at the new Supabase project with the publishable key. Secret values are intentionally not stored in the frontend.
