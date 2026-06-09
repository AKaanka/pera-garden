# Pera Garden

Dynamic one-page wedding venue site with a protected owner admin panel and direct contact actions.

## Current Status

The MVP vertical slice is implemented locally:

- Vite + React + TypeScript app in `app/`
- Supabase migration and seed in `supabase/`
- Public editable section rendering
- Contact section with direct Instagram, phone, WhatsApp, and map actions
- Admin email/password login
- Hero/About/Services/Gallery/Slider/Location/FAQ/Contact draft/publish editors
- Editable Header/Footer chrome with Instagram, phone, WhatsApp, and Google Maps contact actions
- Admin-controlled section order
- Admin-created custom sections and whole-section Hide/Show controls
- Netlify deploy config with SPA redirects and admin noindex headers

Supabase project status:

- MVP database migration applied and verified.
- Public Data API can read published Hero content.
- Public Data API cannot read draft Hero content.
- Temporary owner admin user created and promoted.
- Admin login, Hero publish, and public Hero render verified.
- Newer local migrations for Gallery, Header/Footer chrome, direct-contact actions, and Contact are pending target application and verification.
- Production is blocked until the leaked `sbp_` token is rotated, the real owner account replaces the temp owner, target migrations are applied, Netlify env vars are set, and final media/contact links are published.

## Target Supabase Project

- URL: `https://xaxlsqddnoblcgdqlrmh.supabase.co`
- Project ref: `xaxlsqddnoblcgdqlrmh`
- Region: Central EU / Frankfurt

This machine may have another Supabase account configured. Do not run `supabase login`, `supabase link`, migrations, or deploys until the target account/project is confirmed.

## Setup Order

1. Rotate or revoke the leaked Supabase `sbp_` access token before any new automated access.
2. Confirm the active Supabase account and target project before running CLI or deploy commands.
3. Replace the temporary owner login with the real owner account before production.
4. Run `supabase/manual_launch_update.sql` in Supabase SQL Editor after creating the real owner Auth user.
5. Set Netlify environment variables from `app/.env.example`.
6. Add production media/contact links and test the direct contact buttons from the deployed site.

Detailed steps live in `docs/SETUP.md`.

## Project Docs

- `docs/CONTEXT.md` — small always-load context, invariants, and live state.
- `docs/STATUS.md` — production readiness checklist and current blockers.
- `docs/SETUP.md` — setup runbook, deploy contract, secrets, and content notes.
- `docs/DECISIONS.md` — accepted architecture and product decisions.
- `docs/ROADMAP.md` — recommended build sequence after MVP hardening.

## Frontend

```bash
cd app
npm install
npm run dev
npm run lint
npm run build
```

The local app already has `app/.env.local` pointing at the new Supabase project with the publishable key. Secret values are intentionally not stored in the frontend.
