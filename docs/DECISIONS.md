# Pera Garden — Decisions (ADRs)

Preserve unless there's a clear reason to revisit. Format: **Decision** + operational **Consequences**. Rationale kept to one line.

## ADR-001 — Free-tier only · accepted
Use free-tier services (static host, Supabase, Meta WhatsApp Cloud, Turnstile). *Why: prove visitor→inquiry flow with no fixed monthly cost.*
- No paid SaaS/queues/Redis/analytics/media without approval. Prefer Supabase-native. Recheck free-tier impact before image/analytics/automation-heavy features.

## ADR-002 — One frontend app · accepted
Public site + admin in one Vite+React+TS app under `app/`. *Why: small admin, shares types/auth/deploy.*
- Don't split admin for MVP. Keep `src/App.tsx` thin. Admin → `src/pages/admin/`, public → `src/sections/`.

## ADR-003 — Supabase is backend source of truth · accepted
Postgres, RLS, Auth, Storage, Edge Functions. *Why: covers MVP surfaces, free-tier friendly.*
- Schema → `supabase/migrations/`. RLS + helpers are product contract, not optional. Data access via `app/src/services/` or hooks.

## ADR-004 — Email+password owner auth · accepted
Email/password sign-in; no public sign-up. *Why: built-in email is dev-oriented; magic links wait for custom SMTP; avoids burning link quota per login.*
- Create owner manually in Auth; promote via `supabase/seed.sql`. Revisit magic links after prod email is configured.

## ADR-005 — Admin = active profile · accepted
Admin when `profiles.id = auth.uid()` AND `is_active = true`. *Why: one owner, no role hierarchy yet.*
- `app_private.is_admin()` is the single RLS helper. No `role` column until a real second role exists; if added, migrate DB helper first, then policies + UI.

## ADR-006 — Locale-first JSONB content · accepted
`site_content.content` JSONB with `tr` + `en` keys. *Why: flexible editing without a migration per field.*
- Update TS contracts before shape changes. Public reads = published only. Add `section_key` values incrementally.

## ADR-007 — Contact via Edge Functions · accepted
Browser → `submit-contact`; never direct submission insert or WhatsApp call. *Why: needs validation, rate limit, service-role insert, Turnstile, server-side secrets.*
- Keep WhatsApp/owner-phone/service-role/Turnstile out of Vite env. Function request/response shape is the public contract. Admin retry via authed `retry-whatsapp`.

## ADR-008 — Postgres rate limiting · accepted
`contact_rate_limits` table for IP + normalized-phone limits. *Why: protects anon endpoint without Redis/paid service.*
- Cleanup inline/lightweight until volume proves otherwise. Hash keys with `RATE_LIMIT_PEPPER`. Revisit only if abuse exceeds free-tier comfort.

## ADR-009 — Cautious CLI account state · accepted
No `login`/`link`/migrate/deploy until active account + target project confirmed. *Why: machine may hold another Supabase account.*
- Prefer dashboard or confirmed MCP/CLI. Target details in `SETUP.md`. Treat deploys as production-sensitive.

## ADR-010 — MVP vertical slice before V1 breadth · accepted
Harden Hero→Contact→WhatsApp→Admin-retry before gallery/services/pricing/testimonials/FAQ/analytics/booking/language UI. *Why: core value is inquiry conversion + follow-up.*
- Label new ideas MVP-critical / V1 / backlog. Favor one polished workflow over several partial ones. Use `.agents/tasks/feature.md` before broad new work.

## ADR-011 — Section order in `site_content` · accepted
`site_content.order_index` is display-order source of truth; `/admin/sections` updates draft+published per section (Hero/About/Services/Gallery/Slider/Location/FAQ and `custom_*`). *Why: simple order control, no separate layout table.*
- Public renders visible published sections by `order_index`; `site_content.is_visible` keeps sections in admin while hiding them from the homepage. Keep ordering explicit with a save action. Add a layout model only if sections gain scheduling, per-locale order, or reusable blocks.

## ADR-012 — Custom sections stay generic · accepted
Admin-created sections use `custom_*` `section_key` values and a simple localized content shape (`eyebrow`, `title`, `body`, CTA label/href). *Why: owner can add basic content without code or a new migration per section.*
- Promote a custom section to a built-in section only when it needs a bespoke public layout, media model, or repeated structured items.
