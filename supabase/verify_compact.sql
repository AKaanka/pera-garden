select json_build_object(
  'expected_sections',
  array['chrome', 'hero', 'about', 'services', 'gallery', 'slider', 'location', 'faq', 'contact'],
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
  'section_rows',
  (
    select json_agg(
      json_build_object(
        'section_key', section_key,
        'status', status,
        'has_tr', content ? 'tr',
        'has_en', content ? 'en',
        'order_index', order_index,
        'is_visible', is_visible,
        'published_at', published_at
      )
      order by order_index, section_key, status
    )
    from public.site_content
    where section_key in ('chrome', 'hero', 'about', 'services', 'gallery', 'slider', 'location', 'faq', 'contact')
  ),
  'section_row_count',
  (
    select count(*)
    from public.site_content
    where section_key in ('chrome', 'hero', 'about', 'services', 'gallery', 'slider', 'location', 'faq', 'contact')
      and status in ('draft', 'published')
      and content ? 'tr'
      and content ? 'en'
  ),
  'chrome_direct_contact_fields',
  (
    select json_agg(
      json_build_object(
        'status', status,
        'tr_complete',
        ((content->'tr') ?& array[
          'instagramLabel',
          'instagramHref',
          'phoneLabel',
          'phoneHref',
          'whatsappLabel',
          'whatsappHref',
          'mapLabel',
          'mapHref'
        ]),
        'en_complete',
        ((content->'en') ?& array[
          'instagramLabel',
          'instagramHref',
          'phoneLabel',
          'phoneHref',
          'whatsappLabel',
          'whatsappHref',
          'mapLabel',
          'mapHref'
        ])
      )
      order by status
    )
    from public.site_content
    where section_key = 'chrome'
      and status in ('draft', 'published')
  ),
  'contact_form_fields',
  (
    select json_agg(
      json_build_object(
        'status', status,
        'tr_complete',
        ((content->'tr') ?& array[
          'eyebrow',
          'title',
          'description',
          'firstNameLabel',
          'lastNameLabel',
          'phoneLabel',
          'phoneHelp',
          'messageLabel',
          'submitLabel'
        ]),
        'en_complete',
        ((content->'en') ?& array[
          'eyebrow',
          'title',
          'description',
          'firstNameLabel',
          'lastNameLabel',
          'phoneLabel',
          'phoneHelp',
          'messageLabel',
          'submitLabel'
        ])
      )
      order by status
    )
    from public.site_content
    where section_key = 'contact'
      and status in ('draft', 'published')
  ),
  'site_content_visibility_column',
  (
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'site_content'
        and column_name = 'is_visible'
        and data_type = 'boolean'
        and is_nullable = 'NO'
    )
  ),
  'custom_section_constraint',
  (
    select exists (
      select 1
      from pg_constraint
      where conrelid = 'public.site_content'::regclass
        and conname = 'site_content_section_key_check'
        and pg_get_constraintdef(oid) like '%chrome%'
        and pg_get_constraintdef(oid) like '%gallery%'
        and pg_get_constraintdef(oid) like '%contact%'
        and pg_get_constraintdef(oid) like '%custom_%'
    )
  ),
  'visible_public_policy',
  (
    select exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'site_content'
        and policyname = 'Anonymous can read visible published site content'
        and qual like '%is_visible%'
    )
  ),
  'visible_order_index',
  (
    select exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'site_content'
        and indexname = 'site_content_public_visible_order_idx'
    )
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
  'gallery_bucket',
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
    where id = 'gallery'
  ),
  'audit_fk_indexes',
  (
    select json_agg(indexname order by indexname)
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'site_content'
      and indexname in (
        'site_content_created_by_idx',
        'site_content_updated_by_idx',
        'site_content_published_by_idx'
      )
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
  ),
  'passes',
  (
    (select count(*) = 5
     from information_schema.tables
     where table_schema = 'public'
       and table_name in (
         'profiles',
         'site_content',
         'submissions',
         'contact_rate_limits',
         'whatsapp_delivery_attempts'
       ))
    and
    (select count(*) = 5
     from pg_tables
     where schemaname = 'public'
       and tablename in (
         'profiles',
         'site_content',
         'submissions',
         'contact_rate_limits',
         'whatsapp_delivery_attempts'
       )
       and rowsecurity = true)
    and
    (select count(*) = 18
     from public.site_content
     where section_key in ('chrome', 'hero', 'about', 'services', 'gallery', 'slider', 'location', 'faq', 'contact')
       and status in ('draft', 'published')
       and content ? 'tr'
       and content ? 'en')
    and
    (select count(*) = 2
     from public.site_content
     where section_key = 'chrome'
       and status in ('draft', 'published')
       and (content->'tr') ?& array[
         'instagramLabel',
         'instagramHref',
         'phoneLabel',
         'phoneHref',
         'whatsappLabel',
         'whatsappHref',
         'mapLabel',
         'mapHref'
       ]
       and (content->'en') ?& array[
         'instagramLabel',
         'instagramHref',
         'phoneLabel',
         'phoneHref',
         'whatsappLabel',
         'whatsappHref',
         'mapLabel',
         'mapHref'
       ])
    and
    (select count(*) = 2
     from public.site_content
     where section_key = 'contact'
       and status in ('draft', 'published')
       and (content->'tr') ?& array[
         'eyebrow',
         'title',
         'description',
         'firstNameLabel',
         'lastNameLabel',
         'phoneLabel',
         'phoneHelp',
         'messageLabel',
         'submitLabel'
       ]
       and (content->'en') ?& array[
         'eyebrow',
         'title',
         'description',
         'firstNameLabel',
         'lastNameLabel',
         'phoneLabel',
         'phoneHelp',
         'messageLabel',
         'submitLabel'
       ])
    and
    (select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'site_content'
        and column_name = 'is_visible'
        and data_type = 'boolean'
        and is_nullable = 'NO'
    ))
    and
    (select exists (
      select 1
      from pg_constraint
      where conrelid = 'public.site_content'::regclass
        and conname = 'site_content_section_key_check'
        and pg_get_constraintdef(oid) like '%chrome%'
        and pg_get_constraintdef(oid) like '%gallery%'
        and pg_get_constraintdef(oid) like '%contact%'
        and pg_get_constraintdef(oid) like '%custom_%'
    ))
    and
    (select exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'site_content'
        and policyname = 'Anonymous can read visible published site content'
        and qual like '%is_visible%'
    ))
    and
    (select exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'site_content'
        and indexname = 'site_content_public_visible_order_idx'
    ))
    and
    (select exists (
      select 1
      from storage.buckets
      where id = 'hero'
        and public = true
        and file_size_limit = 10485760
    ))
    and
    (select exists (
      select 1
      from storage.buckets
      where id = 'gallery'
        and public = true
        and file_size_limit = 1073741824
        and allowed_mime_types @> array['image/webp', 'video/mp4', 'video/webm']::text[]
    ))
    and
    (select count(*) = 3
     from pg_indexes
     where schemaname = 'public'
       and tablename = 'site_content'
       and indexname in (
         'site_content_created_by_idx',
         'site_content_updated_by_idx',
         'site_content_published_by_idx'
       ))
    and
    (select count(*) = 15
     from pg_policies
     where schemaname = 'public'
       and tablename in (
         'profiles',
         'site_content',
         'submissions',
         'contact_rate_limits',
         'whatsapp_delivery_attempts'
       ))
  )
) as verification;
