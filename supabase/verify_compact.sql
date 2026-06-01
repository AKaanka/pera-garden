select json_build_object(
  'tables',
  (
    select json_agg(table_name order by table_name)
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'profiles',
        'site_content',
        'submissions',
        'contact_rate_limits',
        'whatsapp_delivery_attempts'
      )
  ),
  'rls',
  (
    select json_object_agg(tablename, rowsecurity)
    from pg_tables
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'site_content',
        'submissions',
        'contact_rate_limits',
        'whatsapp_delivery_attempts'
      )
  ),
  'hero_rows',
  (
    select json_agg(
      json_build_object(
        'section_key', section_key,
        'status', status,
        'has_tr', content ? 'tr',
        'has_en', content ? 'en'
      )
      order by status
    )
    from public.site_content
    where section_key = 'hero'
  ),
  'hero_bucket',
  (
    select json_agg(
      json_build_object(
        'id', id,
        'public', public,
        'file_size_limit', file_size_limit,
        'allowed_mime_types', allowed_mime_types
      )
    )
    from storage.buckets
    where id = 'hero'
  ),
  'policy_count',
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'site_content',
        'submissions',
        'contact_rate_limits',
        'whatsapp_delivery_attempts'
      )
  )
) as verification;
