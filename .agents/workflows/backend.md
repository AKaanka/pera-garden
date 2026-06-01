---
description: Backend workflow for Pera Garden's Supabase layer
---

# Pera Garden — Backend Workflow

## 1. Start From The Existing Backend Shape

- Read the files in `supabase/migrations/` and `supabase/functions/` before changing anything.
- Supabase is the active backend (Postgres + Auth + Storage + Edge Functions). Treat schema, RLS, Storage buckets, and Edge Functions as one connected system.
- Stay within Supabase's free tier (500 MB DB, 1 GB Storage, generous Edge Function quota).

## 2. Choose The Right Backend Surface

- **Migration** — for schema, enums, triggers, helper functions, or RLS policies.
- **Storage bucket + policies** — for gallery and hero images uploaded via the admin panel.
- **Edge Function** — for anything that needs a secret (WhatsApp API token), multi-step logic, or service-role access. The contact form submission MUST go through an Edge Function so the WhatsApp token never leaks to the client.
- **Direct table read/write behind RLS** — for simple authenticated content edits from the admin panel.

## 3. Keep Security Rules Explicit

- Public site: only `SELECT` on published content tables is allowed anonymously.
- Admin panel: `INSERT/UPDATE/DELETE` requires an authenticated session AND a role check (e.g. `is_admin()` helper).
- The contact form is anonymous — write submissions via the Edge Function (using service role), not direct insert.
- Never expose the WhatsApp API token, admin emails, or service-role key to the browser.

## 4. Verify The Whole Path

- Read the frontend call site as well as the backend change.
- Check whether migrations, Storage policies, RLS, and Edge Functions still match the intended user path.
- For the contact form: end-to-end test = form submit → row in `submissions` table → WhatsApp message received.
- Note any hosted secret (`WHATSAPP_TOKEN`, `OWNER_PHONE`, etc.) that must be set in the Supabase dashboard.

## 5. Decision Rule

Choose the smallest backend change that keeps auth, privacy, free-tier usage, and the owner's WhatsApp notification working.
