alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (
    section_key in ('chrome', 'hero', 'about', 'services', 'gallery', 'slider', 'location', 'faq', 'contact')
    or section_key ~ '^custom_[a-z0-9_]{3,64}$'
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
select
  'contact',
  'draft',
  coalesce((select max(order_index) + 1 from public.site_content where status = 'draft' and section_key <> 'chrome'), 7),
  true,
  'tr',
  '{
    "tr": {
      "eyebrow": "Rezervasyon",
      "title": "Tarih ve detayları konuşalım",
      "description": "Bilgilerinizi bırakın; Pera Garden ekibi WhatsApp üzerinden size geri dönsün.",
      "firstNameLabel": "Ad",
      "lastNameLabel": "Soyad",
      "phoneLabel": "Telefon",
      "phoneHelp": "WhatsApp için ülke koduyla yazabilirsiniz: +90 ...",
      "messageLabel": "Mesaj",
      "submitLabel": "Rezervasyon isteği gönder"
    },
    "en": {
      "eyebrow": "Reservation",
      "title": "Let''s talk through your date and details",
      "description": "Leave your information and the Pera Garden team will get back to you on WhatsApp.",
      "firstNameLabel": "First name",
      "lastNameLabel": "Last name",
      "phoneLabel": "Phone",
      "phoneHelp": "You can include your country code for WhatsApp: +90 ...",
      "messageLabel": "Message",
      "submitLabel": "Send reservation request"
    }
  }'::jsonb,
  null
where not exists (
  select 1
  from public.site_content
  where section_key = 'contact'
    and status = 'draft'
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
select
  'contact',
  'published',
  coalesce((select max(order_index) + 1 from public.site_content where status = 'published' and section_key <> 'chrome'), 7),
  true,
  'tr',
  '{
    "tr": {
      "eyebrow": "Rezervasyon",
      "title": "Tarih ve detayları konuşalım",
      "description": "Bilgilerinizi bırakın; Pera Garden ekibi WhatsApp üzerinden size geri dönsün.",
      "firstNameLabel": "Ad",
      "lastNameLabel": "Soyad",
      "phoneLabel": "Telefon",
      "phoneHelp": "WhatsApp için ülke koduyla yazabilirsiniz: +90 ...",
      "messageLabel": "Mesaj",
      "submitLabel": "Rezervasyon isteği gönder"
    },
    "en": {
      "eyebrow": "Reservation",
      "title": "Let''s talk through your date and details",
      "description": "Leave your information and the Pera Garden team will get back to you on WhatsApp.",
      "firstNameLabel": "First name",
      "lastNameLabel": "Last name",
      "phoneLabel": "Phone",
      "phoneHelp": "You can include your country code for WhatsApp: +90 ...",
      "messageLabel": "Message",
      "submitLabel": "Send reservation request"
    }
  }'::jsonb,
  now()
where not exists (
  select 1
  from public.site_content
  where section_key = 'contact'
    and status = 'published'
);

update public.site_content
set content = jsonb_set(
  jsonb_set(
    content,
    '{tr}',
    '{
      "eyebrow": "Rezervasyon",
      "title": "Tarih ve detayları konuşalım",
      "description": "Bilgilerinizi bırakın; Pera Garden ekibi WhatsApp üzerinden size geri dönsün.",
      "firstNameLabel": "Ad",
      "lastNameLabel": "Soyad",
      "phoneLabel": "Telefon",
      "phoneHelp": "WhatsApp için ülke koduyla yazabilirsiniz: +90 ...",
      "messageLabel": "Mesaj",
      "submitLabel": "Rezervasyon isteği gönder"
    }'::jsonb || coalesce(content->'tr', '{}'::jsonb)
  ),
  '{en}',
  '{
    "eyebrow": "Reservation",
    "title": "Let''s talk through your date and details",
    "description": "Leave your information and the Pera Garden team will get back to you on WhatsApp.",
    "firstNameLabel": "First name",
    "lastNameLabel": "Last name",
    "phoneLabel": "Phone",
    "phoneHelp": "You can include your country code for WhatsApp: +90 ...",
    "messageLabel": "Message",
    "submitLabel": "Send reservation request"
  }'::jsonb || coalesce(content->'en', '{}'::jsonb)
)
where section_key = 'contact'
  and status in ('draft', 'published');
