-- Manual launch update for the current Pera Garden production setup.
-- Run this in Supabase Dashboard > SQL Editor after creating the Auth user.
-- Safe to rerun: it updates matching rows and preserves unrelated content.

begin;

-- 1) Promote the owner account created in Supabase Auth.
insert into public.profiles (id, email, is_active)
select id, email, true
from auth.users
where lower(email) = lower('peragarden78@gmail.com')
on conflict (id) do update
set
  email = excluded.email,
  is_active = true,
  updated_at = now();

-- 2) Deactivate other admin profiles for the MVP single-owner setup.
update public.profiles
set
  is_active = false,
  updated_at = now()
where lower(coalesce(email, '')) <> lower('peragarden78@gmail.com');

-- 3) Align Header/Footer CTA wording with the no-form contact flow.
update public.site_content
set content =
  jsonb_set(
    jsonb_set(content, '{tr,ctaLabel}', to_jsonb('İletişim'::text), true),
    '{en,ctaLabel}', to_jsonb('Contact'::text), true
  )
where section_key = 'chrome'
  and status in ('draft', 'published');

-- 4) Align Contact section copy with direct communication buttons.
update public.site_content
set content =
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(content, '{tr,eyebrow}', to_jsonb('İletişim'::text), true),
            '{tr,title}', to_jsonb('Bizimle doğrudan iletişime geçin'::text), true
          ),
          '{tr,description}', to_jsonb('Tarih, kapasite ve davet detayları için size en uygun kanaldan hemen ulaşabilirsiniz.'::text), true
        ),
        '{en,eyebrow}', to_jsonb('Contact'::text), true
      ),
      '{en,title}', to_jsonb('Contact us directly'::text), true
    ),
    '{en,description}', to_jsonb('Reach us through your preferred channel for dates, capacity, and celebration details.'::text), true
  )
where section_key = 'contact'
  and status in ('draft', 'published');

-- 5) Backfill the About strip title used by the recreated About section.
update public.site_content
set content =
  jsonb_set(
    jsonb_set(content, '{tr,experienceTitle}', to_jsonb('Davet deneyimi'::text), true),
    '{en,experienceTitle}', to_jsonb('Celebration experience'::text), true
  )
where section_key = 'about'
  and status in ('draft', 'published');

commit;

-- Quick verification.
select email, is_active
from public.profiles
order by updated_at desc;

select section_key, status, content->'tr' as tr_content, content->'en' as en_content
from public.site_content
where section_key in ('chrome', 'contact', 'about')
order by section_key, status;
