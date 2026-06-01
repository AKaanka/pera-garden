# Deploy Brief Template

Use this before deploying frontend, Supabase changes, or both.

## Change Type

- Frontend only:
- Backend only:
- Full stack:
- Secrets/env:

## Preflight

- Target Supabase project confirmed:
- Active CLI/MCP account confirmed, if used:
- `app/.env.local` or host env checked:
- Required Edge Function secrets checked:
- Free-tier impact checked:

## Rollout Order

1. Apply migrations.
2. Update Storage buckets or policies.
3. Deploy Edge Functions.
4. Deploy frontend.
5. Run post-deploy verification.

Remove steps that do not apply.

## Verification

- Public home page mobile:
- Public home page desktop:
- Admin login:
- Admin edit/publish:
- Contact form validation:
- Contact form stored row:
- WhatsApp delivery or retry-ready failure:
- Supabase usage dashboard:

## Rollback

- Frontend rollback:
- Edge Function rollback:
- Migration rollback:
- Secret/config rollback:
