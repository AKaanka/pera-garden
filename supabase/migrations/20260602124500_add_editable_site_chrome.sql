alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (
    section_key in ('chrome', 'hero', 'about', 'services', 'gallery', 'slider', 'location', 'faq')
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
values
  (
    'chrome',
    'draft',
    -1,
    true,
    'tr',
    '{
      "tr": {
        "brandLabel": "Pera Garden",
        "navItems": [
          { "label": "Hakkımızda", "href": "#about-title" },
          { "label": "Hizmetler", "href": "#services-title" },
          { "label": "Galeri", "href": "#gallery-title" },
          { "label": "Konum", "href": "#location-title" }
        ],
        "ctaLabel": "Rezervasyon",
        "ctaHref": "#contact",
        "instagramLabel": "Instagram",
        "instagramHref": "https://www.instagram.com/",
        "phoneLabel": "Ara",
        "phoneHref": "tel:+900000000000",
        "whatsappLabel": "WhatsApp",
        "whatsappHref": "https://wa.me/900000000000",
        "mapLabel": "Yol Tarifi",
        "mapHref": "https://maps.google.com/",
        "footerText": "Pera Garden",
        "footerLinkLabel": "Admin",
        "footerLinkHref": "/admin"
      },
      "en": {
        "brandLabel": "Pera Garden",
        "navItems": [
          { "label": "About", "href": "#about-title" },
          { "label": "Services", "href": "#services-title" },
          { "label": "Gallery", "href": "#gallery-title" },
          { "label": "Location", "href": "#location-title" }
        ],
        "ctaLabel": "Reservation",
        "ctaHref": "#contact",
        "instagramLabel": "Instagram",
        "instagramHref": "https://www.instagram.com/",
        "phoneLabel": "Call",
        "phoneHref": "tel:+900000000000",
        "whatsappLabel": "WhatsApp",
        "whatsappHref": "https://wa.me/900000000000",
        "mapLabel": "Directions",
        "mapHref": "https://maps.google.com/",
        "footerText": "Pera Garden",
        "footerLinkLabel": "Admin",
        "footerLinkHref": "/admin"
      }
    }'::jsonb,
    null
  ),
  (
    'chrome',
    'published',
    -1,
    true,
    'tr',
    '{
      "tr": {
        "brandLabel": "Pera Garden",
        "navItems": [
          { "label": "Hakkımızda", "href": "#about-title" },
          { "label": "Hizmetler", "href": "#services-title" },
          { "label": "Galeri", "href": "#gallery-title" },
          { "label": "Konum", "href": "#location-title" }
        ],
        "ctaLabel": "Rezervasyon",
        "ctaHref": "#contact",
        "instagramLabel": "Instagram",
        "instagramHref": "https://www.instagram.com/",
        "phoneLabel": "Ara",
        "phoneHref": "tel:+900000000000",
        "whatsappLabel": "WhatsApp",
        "whatsappHref": "https://wa.me/900000000000",
        "mapLabel": "Yol Tarifi",
        "mapHref": "https://maps.google.com/",
        "footerText": "Pera Garden",
        "footerLinkLabel": "Admin",
        "footerLinkHref": "/admin"
      },
      "en": {
        "brandLabel": "Pera Garden",
        "navItems": [
          { "label": "About", "href": "#about-title" },
          { "label": "Services", "href": "#services-title" },
          { "label": "Gallery", "href": "#gallery-title" },
          { "label": "Location", "href": "#location-title" }
        ],
        "ctaLabel": "Reservation",
        "ctaHref": "#contact",
        "instagramLabel": "Instagram",
        "instagramHref": "https://www.instagram.com/",
        "phoneLabel": "Call",
        "phoneHref": "tel:+900000000000",
        "whatsappLabel": "WhatsApp",
        "whatsappHref": "https://wa.me/900000000000",
        "mapLabel": "Directions",
        "mapHref": "https://maps.google.com/",
        "footerText": "Pera Garden",
        "footerLinkLabel": "Admin",
        "footerLinkHref": "/admin"
      }
    }'::jsonb,
    now()
  )
on conflict (section_key, status) do nothing;

update public.site_content
set content = jsonb_set(
  jsonb_set(
    content,
    '{tr}',
    '{
      "brandLabel": "Pera Garden",
      "navItems": [
        { "label": "Hakkımızda", "href": "#about-title" },
        { "label": "Hizmetler", "href": "#services-title" },
        { "label": "Galeri", "href": "#gallery-title" },
        { "label": "Konum", "href": "#location-title" }
      ],
      "ctaLabel": "Rezervasyon",
      "ctaHref": "#contact",
      "instagramLabel": "Instagram",
      "instagramHref": "https://www.instagram.com/",
      "phoneLabel": "Ara",
      "phoneHref": "tel:+900000000000",
      "whatsappLabel": "WhatsApp",
      "whatsappHref": "https://wa.me/900000000000",
      "mapLabel": "Yol Tarifi",
      "mapHref": "https://maps.google.com/",
      "footerText": "Pera Garden",
      "footerLinkLabel": "Admin",
      "footerLinkHref": "/admin"
    }'::jsonb || coalesce(content->'tr', '{}'::jsonb)
  ),
  '{en}',
  '{
    "brandLabel": "Pera Garden",
    "navItems": [
      { "label": "About", "href": "#about-title" },
      { "label": "Services", "href": "#services-title" },
      { "label": "Gallery", "href": "#gallery-title" },
      { "label": "Location", "href": "#location-title" }
    ],
    "ctaLabel": "Reservation",
    "ctaHref": "#contact",
    "instagramLabel": "Instagram",
    "instagramHref": "https://www.instagram.com/",
    "phoneLabel": "Call",
    "phoneHref": "tel:+900000000000",
    "whatsappLabel": "WhatsApp",
    "whatsappHref": "https://wa.me/900000000000",
    "mapLabel": "Directions",
    "mapHref": "https://maps.google.com/",
    "footerText": "Pera Garden",
    "footerLinkLabel": "Admin",
    "footerLinkHref": "/admin"
  }'::jsonb || coalesce(content->'en', '{}'::jsonb)
)
where section_key = 'chrome'
  and status in ('draft', 'published');
