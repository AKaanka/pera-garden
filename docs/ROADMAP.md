# Pera Garden — Roadmap

Ordered by business value: visitor trust → inquiry conversion → owner follow-up. Update when scope changes.

## Phase 0 — MVP hardening
Make the Hero→Contact→WhatsApp→Admin-retry loop production-ready. (Live state + checklist: `STATUS.md`.)
**Done when:** visitor submits from prod site · owner gets WhatsApp · failed delivery visible+retryable · public can't read drafts/submissions.

## Phase 1 — Public trust & conversion
Make the one-pager feel complete for couples from Instagram/Google. Order: About/venue story (✅ editable) → day-flow Slider (✅) → Services/Packages (✅) → Location/contact details + direct actions (✅ locally editable, directions → Google Maps) → FAQ (✅) → Testimonials (only with real quotes).
- Keep bespoke public layouts limited to sections that truly need them; use admin-created custom sections for simple text/CTA content. Keep primary contact CTA visible + repeated, with Instagram/phone/WhatsApp/Google Maps actions editable through Chrome content. Order and whole-section visibility are admin-controlled via `/admin/sections`.
- Gallery renders a placeholder when empty so nav links always resolve. Footer displays "Safranbolu" next to the phone for venue location context.

## Phase 2 — Image pipeline & gallery
Owner manages imagery without dev help. Local implementation now covers admin Hero/Services/Gallery uploads, `browser-image-compression`, a 1 GB `gallery` bucket migration, public Gallery rendering with separate photo/video views, large media viewer, no visible public captions, cross-media viewer navigation, desktop arrows, mobile swipe navigation, and admin create/edit/delete/reorder/hide/show for gallery photos/videos. Remaining work: apply migration after access is confirmed, test real uploads on target, and add a separate gallery metadata table only if content volume outgrows `site_content`.
**Done when:** owner can upload/reorder/describe/publish/remove gallery photos/videos · gallery fast on mobile · within free tier.

## Phase 3 — Admin content system
Consistency as more sections become editable (started: separate editors, order screen, Hide/Show, generic custom sections, Chrome direct-contact editing, Contact editor, compact text-style controls, locale style-copy actions, and per-section background color picker with 3 warm presets). Work: extract shared load/save patterns once repetition slows changes · introduce `useContent` only when it removes real repetition · keep reusable form fields/status messages compact · restore/history UI only after content volume makes mistakes costly.
**Done when:** screens consistent · section contracts typed · publish stays explicit + safe.

## Phase 4 — Localization & polish
Turkish-first prod, English available. Work: language switcher (only after EN is prod-ready) · localized form labels/validation/section copy/verification helper states · standardized admin date/time · per-locale metadata/OG if needed.
**Done when:** TR polished end-to-end · EN not half-finished · admin copy direct + operational.

## Phase 5 — Measurement & ops
Know if the site generates inquiries without extra complexity. Local SEO ops are now in place: route metadata helper, runtime and static JSON-LD, configurable social preview image, admin crawl controls, sitemap generation via `VITE_SITE_URL`, and build-time SEO verification. Remaining work: set the real production domain, set the final `VITE_SOCIAL_IMAGE_URL`, submit sitemap after launch if needed, start with submission counts + owner feedback · privacy-friendly analytics only if needed · export/archive only when volume justifies · monitor Storage/DB size/Edge usage.
**Done when:** owner can answer "are we getting useful inquiries?" without paid tooling · ops stay light.

## Backlog (deferred until core loop + trust sections are in prod)
Booking calendar · payments/deposits · multi-owner roles · magic-link auth w/ custom SMTP · advanced analytics · CRM integrations · automated email follow-up.
