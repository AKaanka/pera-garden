---
description: Deployment workflow for Pera Garden frontend and Supabase changes
---

# Pera Garden — Deploy Workflow

Always load `docs/CONTEXT.md` first. If CLI access is needed, confirm the active Supabase account and target project before `login`, `link`, migrations, or function deploys.

## 1. Confirm What Is Changing

- **Frontend only:** `app/`
- **Backend only:** `supabase/migrations/` and/or `supabase/functions/`
- **Full stack:** both layers, plus any secrets or env changes

## 2. Frontend Checklist

- Verify Vite env values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are correct for the target environment.
- Verify optional browser-safe Turnstile config (`VITE_TURNSTILE_SITE_KEY`) matches the production Turnstile site.
- Run `npm run lint` in `/app`.
- Run `npm run build` in `/app`.
- Deploy to the chosen free static host (Vercel / Netlify / Cloudflare Pages).
- Confirm HTTPS is enforced and the custom domain (if any) resolves.
- Confirm `/admin` and `/admin/reset` deep links work on the static host.

## 3. Supabase Checklist

- Confirm new migrations are ordered correctly and reviewed as a sequence; use `docs/SETUP.md` for the current pending target migration list.
- Confirm Storage buckets and their policies exist for any new media (`hero`, and `gallery` once the gallery migrations are applied).
- Confirm Edge Functions still match the latest schema and helper functions.
- Confirm secrets are set in Supabase dashboard: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `OWNER_PHONE`, `TURNSTILE_SECRET`, `RATE_LIMIT_PEPPER`.
- Confirm production does not allow missing Turnstile verification (`ALLOW_MISSING_TURNSTILE` absent or `false`).

## 4. Rollout Order

1. Apply migrations.
2. Update Storage buckets / policies.
3. Deploy Edge Functions that depend on the new schema.
4. Deploy frontend that calls the new functions.
5. Treat secret changes as part of the same rollout when a function depends on them.

## 5. Post-Deploy Verification

- Load the public one-pager on mobile and desktop.
- Log into the admin panel and edit one field; confirm it appears on the public site.
- Submit a real test entry through the contact form and confirm the WhatsApp message reaches the owner.
- Check Supabase usage dashboard to confirm you are still inside the free tier.

## 6. Rollback Thinking

- If a migration is risky, write the reversing migration before shipping.
- If an Edge Function deploy fails, keep the frontend on the previous working contract.
- If secrets are missing or wrong, stop and fix config before blaming application code.
