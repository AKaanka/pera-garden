# Pera Garden — Status & Go-Live

Single source of truth for production readiness. A checked item = verified against the **target project + deployed frontend**, not just configured locally. Last audit: 2026-06-05.

## Snapshot
- ✅ Local `lint` + `build` pass on 2026-06-05 after the latest in-progress app changes.
- ⚠️ Worktree has in-progress changes; review/stage intentionally before deploy or handoff.
- ✅ Target has the MVP + pre-Gallery editable-section migrations applied; newer Gallery/Chrome/Contact migrations are local/pending target application.
- ✅ Both Edge Functions deployed; pepper set.
- ✅ Expanded `verify_compact.sql` passed on target for the pre-Gallery six editable sections; Gallery/Chrome/Contact verification remains local until their newer migrations are applied.
- ✅ `verify_access.sql` passed on target; anon/admin RLS behavior matches the contract.
- ✅ Hero bucket file-size limit raised to 10 MB; admin upload accepts 30 MB source images.
- ✅ Performance advisor unindexed-FK warnings fixed for `site_content` audit columns.
- ✅ Edge Function deploy config verified; `submit-contact` v4 redeployed with localized validation copy.
- ⚠️ Blocked on: token rotation, real owner, WhatsApp + Turnstile creds, prod Hero image.
- 🔒 **Security:** an `sbp_` token was pasted in chat — treat as compromised; rotate/revoke before any new automated access.

## 1. Ownership & access
- [ ] Real owner Auth user created
- [ ] Temp owner removed/disabled/marked non-prod
- [ ] Real owner promoted (`is_active = true`)
- [ ] Auth redirect URL added for `/admin/reset` on local/prod origins
- [ ] Leaked-password protection enabled
- [ ] Public sign-up unavailable from frontend
- [ ] Admin login works at `/admin`; non-admin authed access rejected

## 2. Secrets & env
- [ ] Frontend has only browser-safe `VITE_*` (URL, ANON_KEY, TURNSTILE_SITE_KEY)
- [ ] Edge Functions have: SUPABASE_URL, SERVICE_ROLE_KEY, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, OWNER_PHONE, TURNSTILE_SECRET, RATE_LIMIT_PEPPER
- [ ] `ALLOW_MISSING_TURNSTILE` removed or `false`

## 3. Data & security
- [x] MVP + pre-Gallery editable-section migrations applied to target
- [x] `supabase/verify_compact.sql` passes for target-applied sections
- [ ] Newer Gallery/Chrome/Contact migrations applied to target and verified
- [x] Anon **can** read published Hero/About/Services/Slider/Location/FAQ
- [x] Anon **cannot** read any draft content or submissions
- [x] Authed admin can read submissions
- [x] Hero bucket exists, public-read, admin-write
- [x] `site_content` audit foreign keys have covering indexes

## 4. Edge Functions
- [x] `submit-contact` deployed `verify_jwt=false`; `retry-whatsapp` deployed `verify_jwt=true`
- [x] Validation errors on bad input
- [ ] Rejects missing/invalid Turnstile in prod
- [ ] Valid submission stored; rate limiting works (IP + phone)
- [ ] WhatsApp template approved in Meta; owner receives it
- [ ] Failure path records failed attempt + leaves retry; admin retry works

## 5. Frontend build & UX
- [x] `lint` + `build` pass from `app/`
  - Local bundle-split pass complete: `App.tsx` now lazy-loads the public homepage and admin routes so visitor traffic avoids downloading admin/editor code on first load; the previous 500 kB chunk warning is gone in local builds.
- [ ] Homepage loads mobile + desktop
  - Local pass complete: Hero/About/Slider/Services/FAQ/Location/Contact render on mobile+desktop with no horizontal overflow; content-read failure falls back to a clear state plus contact form.
- [ ] Hero image production-ready
- [x] Admin Hero image upload writes compressed WebP path
- [x] Admin Hero editor previews selected storage image
- [x] Hero TR copy polish applied to draft + published rows
- [ ] Contact form labels/errors/success/disabled states clear
  - Local pass complete: required-field errors, disabled/config state, Turnstile reset, and mobile+desktop smoke checks verified on `http://localhost:5173/`.
  - Local function contract pass complete: structured `VALIDATION_ERROR` and `RATE_LIMITED` Edge Function responses render as inline field/status messages instead of raw SDK errors.
  - Local copy/verification pass complete: the section heading/body are locale-aware, submit stays disabled until Turnstile is solved when the widget is enabled, and the form now shows explicit verification-ready / verification-complete / verification-error helper states.
- [ ] Each admin editor (Hero/About/Services/Gallery/Slider/Location/FAQ/Contact) saves draft + publishes; published appears on homepage
  - Local pass complete: mocked Hero/About/Services/Slider/Location/FAQ editors showed unsaved-change warnings, published draft+published updates, and public homepage rendered each published title.
  - Local Services design pass complete: admin Services editor supports image path/alt, compressed service uploads, drag/drop + up/down item order, confirmed remove, admin-only hidden services, and public image-card rendering.
  - Local Gallery implementation complete: added Gallery as a built-in section with photo/video uploads, edit/create/remove/reorder/hide/show item controls, public media grid rendering, `gallery` Storage bucket migration, and verification-script coverage. Public gallery now separates photos/videos, opens media in a larger viewer, hides visible titles/captions, supports cross-item navigation from the viewer itself, uses desktop arrows and mobile swipe navigation, and supports browser-local media preview while target Storage is missing/behind. Not applied to target yet.
  - Local Header/Footer implementation complete: fixed header nav and fixed footer render outside the section order; admin can edit labels/links through `/admin/sections/chrome`, but position is locked in code. Migration is local only until target access is confirmed.
  - Local direct-contact action pass complete: Instagram, phone, WhatsApp, and Google Maps labels/links now live in editable Chrome content, render near the contact form and footer, use mobile brand-colored action cards, stay backward-compatible through Chrome content fallbacks, and are covered by `verify_compact.sql`.
  - Local Contact editor pass complete: Reservation/Contact is now a built-in editable section at `/admin/sections/contact`; admin can edit the section heading, description, form labels, helper text, submit label, section order, and visibility while form submission remains routed through `submit-contact`.
  - Local verification alignment pass complete: `verify_compact.sql` and `verify_access.sql` now expect the full local built-in section set through Contact, not only the pre-Contact 16-row shape; `verify_compact.sql` also checks the editable Contact form-copy fields.
  - Local migration idempotency pass complete: Chrome and Contact migrations backfill missing JSON keys on existing rows without overwriting owner-edited values.
  - Local typography-controls pass complete: Hero/About/Services/Gallery/Slider/Location/FAQ/Contact/Custom/Header/Footer text fields now support manual font size, bold, italic, family, and color controls, compact style disclosures, reset-to-default, and copy-style-to-other-locale actions.
  - Local save fallback pass complete: manual draft/publish still works in local development when the remote Supabase schema is missing newer section migrations because content can fall back to browser-local overrides.
  - Local admin editor pattern pass complete: repeated locale text/style update helpers are consolidated inside the section editor while keeping each section's content contract unchanged.
- [ ] `/admin/sections` order saves; public order matches
  - Local pass complete: mocked admin reordered About after Slider; save issued draft+published updates for all six pre-Gallery sections and confirmed the saved public sequence.
  - Local section workflow pass complete: `/admin/sections` now has whole-section Hide/Show controls, admin-created custom sections, and public reads filter hidden sections via `site_content.is_visible`. Public reads are backward-compatible before the visibility migration because filtering happens after rows load. Browser automation was limited by a missing local Playwright browser binary; `lint`, `build`, and code-level checks passed.
  - Local RLS hardening pass complete: the visibility/custom-section migration now replaces anon `site_content` reads with visible-published-only RLS, and `verify_compact.sql` / `verify_access.sql` check the new column, policy, index, and custom-section constraint.
  - Local custom-section lifecycle pass complete: `/admin/sections` can remove only `custom_*` sections after confirmation, keeps built-in sections protected, and compacts remaining order after removal.
- [ ] Submissions list loads; failed deliveries show retry
  - Local pass complete: mocked admin session shows failed submission, retry action calls `retry-whatsapp`, and `WHATSAPP_RETRY_FAILED` renders as a warning status.
  - Local submission-delete pass complete: `/admin/submissions` now deletes one submission at a time with confirmation, removes the card immediately after success, and relies on the existing admin delete RLS policy plus `whatsapp_delivery_attempts.submission_id on delete cascade` for full cleanup.
  - Local delete-all pass complete: `/admin/submissions` now also offers a confirmed bulk delete that removes every submission row in the table, not only the currently listed 50 cards, and fully clears related WhatsApp delivery history through the existing cascade.
  - Local submission-triage pass complete: `/admin/submissions` now includes search, status filters, and quick per-status counts so the owner can narrow to failed/pending inquiries faster without reloading or leaving the page.

## 6. Hosting & domain
- [ ] Host selected; prod env vars set; HTTPS works; custom domain (if used)
- [x] OG title/description correct; HTML lang + copy match default locale
  - Local metadata pass complete: public routes now set route-aware title, description, canonical, OG, Twitter card, and index/follow robots metadata; admin/reset routes set admin-specific copy and `noindex, nofollow`.
- [x] `/admin` deep-link/404 works on static host
  - Local hosting fallback pass complete: added Netlify/Cloudflare Pages `_redirects` and Vercel rewrites so SPA deep links like `/admin`, `/admin/reset`, and section editor URLs resolve to `index.html`.

## 7. Post-launch watch
- [ ] One real test inquiry → row in `submissions` → owner receives WhatsApp
- [ ] Supabase usage within free tier
- [ ] No secrets in devtools/logs/repo
- [ ] Launch issues recorded here

## Recommended next actions (ordered)
1. Rotate/revoke leaked token → 2. Confirm safe access method → 3. Real owner replaces temp → 4. Set Turnstile + WhatsApp secrets → 5. `ALLOW_MISSING_TURNSTILE=false` → 6. Add production Hero image → 7. Redeploy `submit-contact` if Turnstile/WhatsApp handling changes → 8. Run one real test submission.

## Local repair note (one-off, 2026-06-01)
macOS quarantine blocked native Rollup/esbuild binaries; removed `com.apple.quarantine` + `npm rebuild esbuild`. Touched only ignored `node_modules` — no source/lockfile changes.
