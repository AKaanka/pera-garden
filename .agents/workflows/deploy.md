---
description: Deployment workflow for Pera Garden frontend and Supabase changes
---

# Pera Garden — Deploy Workflow

## 1. Confirm What Is Changing

- **Frontend only:** `app/`
- **Backend only:** `supabase/migrations/` and/or `supabase/functions/`
- **Full stack:** both layers, plus any secrets or env changes

## 2. Frontend Checklist

- Verify Vite env values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are correct for the target environment.
- Run `npm run lint` in `/app`.
- Run `npm run build` in `/app`.
- Deploy to the chosen free static host (Vercel / Netlify / Cloudflare Pages).
- Confirm HTTPS is enforced and the custom domain (if any) resolves.

## 3. Supabase Checklist

- Confirm new migrations are ordered correctly and reviewed as a sequence.
- Confirm Storage buckets and their policies exist for any new media.
- Confirm Edge Functions still match the latest schema and helper functions.
- Confirm secrets are set in Supabase dashboard: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `OWNER_PHONE`, and any CAPTCHA secret.

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
