alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (
    section_key in ('hero', 'about', 'services', 'gallery', 'slider', 'location', 'faq')
    or section_key ~ '^custom_[a-z0-9_]{3,64}$'
  );

update public.site_content
set order_index = order_index + 1
where section_key in ('slider', 'location', 'faq')
  and not exists (
    select 1
    from public.site_content existing_gallery
    where existing_gallery.section_key = 'gallery'
  );

insert into public.site_content (
  section_key,
  status,
  order_index,
  is_visible,
  default_locale,
  content,
  published_at
)
values
  (
    'gallery',
    'draft',
    3,
    true,
    'tr',
    '{
      "tr": {
        "eyebrow": "Galeri",
        "title": "Bahçeden kareler",
        "subtitle": "Fotoğraf ve kısa videolarla Pera Garden atmosferini, davet düzenini ve günün ritmini görün.",
        "items": [
          {
            "id": "gallery-garden",
            "type": "photo",
            "bucket": "gallery",
            "path": "",
            "title": "Bahçe atmosferi",
            "caption": "Pera Garden''ın açık hava davet hissini gösteren görselleri burada paylaşın.",
            "alt": "Pera Garden bahçe atmosferi",
            "isPublished": true
          }
        ]
      },
      "en": {
        "eyebrow": "Gallery",
        "title": "Moments from the garden",
        "subtitle": "Share photos and short videos that show the atmosphere, layout, and rhythm of Pera Garden.",
        "items": [
          {
            "id": "gallery-garden",
            "type": "photo",
            "bucket": "gallery",
            "path": "",
            "title": "Garden atmosphere",
            "caption": "Use this space to share visuals from Pera Garden''s open-air celebration setting.",
            "alt": "Pera Garden garden atmosphere",
            "isPublished": true
          }
        ]
      }
    }'::jsonb,
    null
  ),
  (
    'gallery',
    'published',
    3,
    true,
    'tr',
    '{
      "tr": {
        "eyebrow": "Galeri",
        "title": "Bahçeden kareler",
        "subtitle": "Fotoğraf ve kısa videolarla Pera Garden atmosferini, davet düzenini ve günün ritmini görün.",
        "items": [
          {
            "id": "gallery-garden",
            "type": "photo",
            "bucket": "gallery",
            "path": "",
            "title": "Bahçe atmosferi",
            "caption": "Pera Garden''ın açık hava davet hissini gösteren görselleri burada paylaşın.",
            "alt": "Pera Garden bahçe atmosferi",
            "isPublished": true
          }
        ]
      },
      "en": {
        "eyebrow": "Gallery",
        "title": "Moments from the garden",
        "subtitle": "Share photos and short videos that show the atmosphere, layout, and rhythm of Pera Garden.",
        "items": [
          {
            "id": "gallery-garden",
            "type": "photo",
            "bucket": "gallery",
            "path": "",
            "title": "Garden atmosphere",
            "caption": "Use this space to share visuals from Pera Garden''s open-air celebration setting.",
            "alt": "Pera Garden garden atmosphere",
            "isPublished": true
          }
        ]
      }
    }'::jsonb,
    now()
  )
on conflict (section_key, status) do nothing;

insert into storage.buckets (id, name, "public", file_size_limit, allowed_mime_types)
values
  (
    'gallery',
    'gallery',
    true,
    52428800,
    array[
      'image/webp',
      'image/jpeg',
      'image/png',
      'image/avif',
      'video/mp4',
      'video/quicktime',
      'video/webm'
    ]
  )
on conflict (id) do update
set
  "public" = excluded."public",
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can insert gallery media" on storage.objects;
drop policy if exists "Admins can update gallery media" on storage.objects;
drop policy if exists "Admins can delete gallery media" on storage.objects;

create policy "Admins can insert gallery media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and (select app_private.is_admin()));

create policy "Admins can update gallery media"
  on storage.objects for update to authenticated
  using (bucket_id = 'gallery' and (select app_private.is_admin()))
  with check (bucket_id = 'gallery' and (select app_private.is_admin()));

create policy "Admins can delete gallery media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'gallery' and (select app_private.is_admin()));
