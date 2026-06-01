---
trigger: manual
---

# Pera Garden — Design Rules

## Core Direction

- Design as an **elegant marketing one-pager** for a wedding venue — evoke romance, trust, and timeless beauty.
- **Mobile-first**: most visitors will arrive from Instagram or Google on a phone.
- Favor generous whitespace, refined typography, and large emotive imagery over dense UI.
- The admin panel is a separate concern: it should be **functional and calm**, not marketing-styled.

## Visual Language

- **Palette:** soft, warm neutrals (ivory, sand, muted greens or dusty rose) with one accent for CTAs. Avoid harsh black; prefer deep charcoal.
- **Typography:** pair a refined serif (headings) with a clean sans-serif (body). Use Google Fonts (free).
- **Imagery:** full-bleed hero, gallery grid/carousel, soft rounded corners, gentle shadows.
- **Motion:** subtle fade/slide on scroll. No aggressive animation.

## Styling Rules

- Use design tokens defined in `app/src/index.css` (colors, spacing, radii, typography) before introducing new values.
- Prefer reusable component classes in `app/src/App.css` over inline style objects.
- Keep spacing on a consistent scale (e.g. 4 / 8 / 16 / 24 / 32 / 48 / 64).
- Public site and admin panel share tokens but may diverge in component density.

## Interaction Rules

- Touch targets ≥ 44px on mobile.
- Primary CTA ("Reserve", "Contact Us", "Get in Touch") must be visible at all times — sticky header or floating button on mobile.
- Loading, empty, and success states must feel intentional (e.g. "Thanks! We'll reach out on WhatsApp shortly.").
- Form errors appear inline, near the field, in plain language.

## Accessibility Rules

- All inputs need visible labels (no placeholder-only labels).
- Icon-only buttons need `aria-label`.
- Visible focus states on all interactive elements.
- Color must support meaning, not carry it alone (e.g. error = red + icon + text).
- Maintain WCAG AA contrast for all text.

## Content Rules

- Public copy is warm and aspirational, but **short** — no walls of text.
- Admin copy is direct and operational: "Save changes", "Upload photo", "Publish".
- Use clear date/time formats appropriate for the venue's locale.
- Form field labels: "First name", "Last name", "Phone", "Message".
