create temp table access_verification (
  check_name text primary key,
  result jsonb
) on commit preserve rows;

grant insert, select on access_verification to anon, authenticated;

begin;
set local role anon;
insert into access_verification values (
  'anon',
  jsonb_build_object(
    'can_select_site_content', has_table_privilege('anon', 'public.site_content', 'select'),
    'published_sections', (select count(*) from public.site_content where status = 'published'),
    'visible_published_sections', (select count(*) from public.site_content where status = 'published' and is_visible = true),
    'draft_sections', (select count(*) from public.site_content where status = 'draft'),
    'can_select_submissions', has_table_privilege('anon', 'public.submissions', 'select')
  )
);
commit;

begin;
select set_config(
  'request.jwt.claim.sub',
  (
    select id::text
    from public.profiles
    where is_active = true
    order by created_at asc
    limit 1
  ),
  true
);
set local role authenticated;
insert into access_verification values (
  'admin',
  jsonb_build_object(
    'is_admin', (select app_private.is_admin()),
    'can_select_submissions', has_table_privilege('authenticated', 'public.submissions', 'select'),
    'submissions', (select count(*) from public.submissions),
    'all_sections', (select count(*) from public.site_content)
  )
);
commit;

select jsonb_object_agg(check_name, result) || jsonb_build_object(
  'passes',
  ((select (result->>'can_select_site_content')::boolean from access_verification where check_name = 'anon') = true)
  and ((select (result->>'published_sections')::int from access_verification where check_name = 'anon') =
       (select (result->>'visible_published_sections')::int from access_verification where check_name = 'anon'))
  and ((select (result->>'draft_sections')::int from access_verification where check_name = 'anon') = 0)
  and ((select (result->>'can_select_submissions')::boolean from access_verification where check_name = 'anon') = false)
  and ((select (result->>'is_admin')::boolean from access_verification where check_name = 'admin') = true)
  and ((select (result->>'can_select_submissions')::boolean from access_verification where check_name = 'admin') = true)
  and ((select (result->>'all_sections')::int from access_verification where check_name = 'admin') >= 18)
) as access_verification
from access_verification;
