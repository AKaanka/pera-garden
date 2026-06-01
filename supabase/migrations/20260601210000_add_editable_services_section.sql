alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (section_key in ('hero', 'about', 'services', 'slider'));

update public.site_content
set order_index = 3
where section_key = 'slider';

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
    'services',
    'draft',
    2,
    'tr',
    '{
      "tr": {
        "eyebrow": "Hizmetler",
        "title": "Davetiniz için temel hazırlıklar",
        "subtitle": "Pera Garden, düğün gününüzün ana ihtiyaçlarını tek bahçe akışında sade ve anlaşılır şekilde planlar.",
        "items": [
          {
            "title": "Nikâh ve karşılama alanı",
            "description": "Misafir gelişi, tören düzeni ve ilk karşılama anları için planlanan açık hava kullanımı."
          },
          {
            "title": "Yemek ve servis akışı",
            "description": "Davet ritmine uygun masa düzeni, servis planı ve ekip koordinasyonu."
          },
          {
            "title": "Müzik ve kutlama düzeni",
            "description": "Günün finalini taşıyan dans, müzik ve kutlama alanı için pratik yerleşim."
          }
        ]
      },
      "en": {
        "eyebrow": "Services",
        "title": "Essentials for your celebration",
        "subtitle": "Pera Garden keeps the main wedding-day needs clear, coordinated, and easy to follow in one garden flow.",
        "items": [
          {
            "title": "Ceremony and welcome area",
            "description": "Outdoor use planned for guest arrival, ceremony layout, and the first welcome moments."
          },
          {
            "title": "Dinner and service flow",
            "description": "Table layout, service planning, and team coordination shaped around the celebration rhythm."
          },
          {
            "title": "Music and celebration setup",
            "description": "A practical layout for dancing, music, and the closing energy of the day."
          }
        ]
      }
    }'::jsonb,
    null
  ),
  (
    'services',
    'published',
    2,
    'tr',
    '{
      "tr": {
        "eyebrow": "Hizmetler",
        "title": "Davetiniz için temel hazırlıklar",
        "subtitle": "Pera Garden, düğün gününüzün ana ihtiyaçlarını tek bahçe akışında sade ve anlaşılır şekilde planlar.",
        "items": [
          {
            "title": "Nikâh ve karşılama alanı",
            "description": "Misafir gelişi, tören düzeni ve ilk karşılama anları için planlanan açık hava kullanımı."
          },
          {
            "title": "Yemek ve servis akışı",
            "description": "Davet ritmine uygun masa düzeni, servis planı ve ekip koordinasyonu."
          },
          {
            "title": "Müzik ve kutlama düzeni",
            "description": "Günün finalini taşıyan dans, müzik ve kutlama alanı için pratik yerleşim."
          }
        ]
      },
      "en": {
        "eyebrow": "Services",
        "title": "Essentials for your celebration",
        "subtitle": "Pera Garden keeps the main wedding-day needs clear, coordinated, and easy to follow in one garden flow.",
        "items": [
          {
            "title": "Ceremony and welcome area",
            "description": "Outdoor use planned for guest arrival, ceremony layout, and the first welcome moments."
          },
          {
            "title": "Dinner and service flow",
            "description": "Table layout, service planning, and team coordination shaped around the celebration rhythm."
          },
          {
            "title": "Music and celebration setup",
            "description": "A practical layout for dancing, music, and the closing energy of the day."
          }
        ]
      }
    }'::jsonb,
    now()
  )
on conflict (section_key, status) do nothing;
