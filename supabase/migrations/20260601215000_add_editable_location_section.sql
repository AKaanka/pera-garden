alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (section_key in ('hero', 'about', 'services', 'slider', 'location'));

insert into public.site_content (
  section_key,
  status,
  order_index,
  default_locale,
  content,
  published_at
)
values
  (
    'location',
    'draft',
    4,
    'tr',
    '{
      "tr": {
        "eyebrow": "Konum",
        "title": "Davetiniz için ulaşımı kolay bir buluşma noktası",
        "body": "Pera Garden konum bilgileri ve yol tarifi detayları davet planınız netleştikçe burada güncellenir.",
        "addressLabel": "Adres",
        "address": "Adres bilgisi yakında eklenecek.",
        "directionsLabel": "Yol tarifi al",
        "directionsHref": "#contact",
        "note": "Davetiniz için net yol tarifi ve otopark bilgisi paylaşmak isterseniz bu alanı admin panelinden güncelleyebilirsiniz."
      },
      "en": {
        "eyebrow": "Location",
        "title": "An easy meeting point for your celebration",
        "body": "Pera Garden location and directions can be updated here as the final event details become clear.",
        "addressLabel": "Address",
        "address": "Address details will be added soon.",
        "directionsLabel": "Get directions",
        "directionsHref": "#contact",
        "note": "Use the admin panel to add exact directions and parking notes when they are ready."
      }
    }'::jsonb,
    null
  ),
  (
    'location',
    'published',
    4,
    'tr',
    '{
      "tr": {
        "eyebrow": "Konum",
        "title": "Davetiniz için ulaşımı kolay bir buluşma noktası",
        "body": "Pera Garden konum bilgileri ve yol tarifi detayları davet planınız netleştikçe burada güncellenir.",
        "addressLabel": "Adres",
        "address": "Adres bilgisi yakında eklenecek.",
        "directionsLabel": "Yol tarifi al",
        "directionsHref": "#contact",
        "note": "Davetiniz için net yol tarifi ve otopark bilgisi paylaşmak isterseniz bu alanı admin panelinden güncelleyebilirsiniz."
      },
      "en": {
        "eyebrow": "Location",
        "title": "An easy meeting point for your celebration",
        "body": "Pera Garden location and directions can be updated here as the final event details become clear.",
        "addressLabel": "Address",
        "address": "Address details will be added soon.",
        "directionsLabel": "Get directions",
        "directionsHref": "#contact",
        "note": "Use the admin panel to add exact directions and parking notes when they are ready."
      }
    }'::jsonb,
    now()
  )
on conflict (section_key, status) do nothing;
