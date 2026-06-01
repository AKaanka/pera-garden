alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (section_key in ('hero', 'about', 'slider'));

update public.site_content
set order_index = 0
where section_key = 'hero';

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
    'about',
    'draft',
    1,
    'tr',
    '{
      "tr": {
        "eyebrow": "Pera Garden deneyimi",
        "title": "Şehrin ritminden uzak, davetinize yakın",
        "body": "Pera Garden; açık hava ferahlığını, özenli servis akışını ve sade bir zarafeti aynı bahçede buluşturur. Nikâh, yemek ve kutlama anları için planlanan alan, misafirlerinizin rahatça hareket edebileceği sıcak bir atmosfer sunar.",
        "highlights": [
          {
            "title": "Bahçe atmosferi",
            "description": "Doğal ışık, yeşil doku ve fotoğraf dostu açık alanlar."
          },
          {
            "title": "Akıcı organizasyon",
            "description": "Karşılama, tören, yemek ve kutlama akışı tek planda düşünülür."
          },
          {
            "title": "Samimi ölçek",
            "description": "Gösterişli ama yorucu olmayan, davetlilerinize yakın hissettiren bir düzen."
          }
        ]
      },
      "en": {
        "eyebrow": "Pera Garden experience",
        "title": "Away from the rush, close to your celebration",
        "body": "Pera Garden brings open-air freshness, thoughtful service flow, and quiet elegance into one garden setting for ceremonies, dinners, and warm celebrations.",
        "highlights": [
          {
            "title": "Garden atmosphere",
            "description": "Natural light, greenery, and photo-friendly outdoor spaces."
          },
          {
            "title": "Smooth organization",
            "description": "Welcoming, ceremony, dinner, and celebration flow planned together."
          },
          {
            "title": "Intimate scale",
            "description": "A graceful setting that feels close and comfortable for your guests."
          }
        ]
      }
    }'::jsonb,
    null
  ),
  (
    'about',
    'published',
    1,
    'tr',
    '{
      "tr": {
        "eyebrow": "Pera Garden deneyimi",
        "title": "Şehrin ritminden uzak, davetinize yakın",
        "body": "Pera Garden; açık hava ferahlığını, özenli servis akışını ve sade bir zarafeti aynı bahçede buluşturur. Nikâh, yemek ve kutlama anları için planlanan alan, misafirlerinizin rahatça hareket edebileceği sıcak bir atmosfer sunar.",
        "highlights": [
          {
            "title": "Bahçe atmosferi",
            "description": "Doğal ışık, yeşil doku ve fotoğraf dostu açık alanlar."
          },
          {
            "title": "Akıcı organizasyon",
            "description": "Karşılama, tören, yemek ve kutlama akışı tek planda düşünülür."
          },
          {
            "title": "Samimi ölçek",
            "description": "Gösterişli ama yorucu olmayan, davetlilerinize yakın hissettiren bir düzen."
          }
        ]
      },
      "en": {
        "eyebrow": "Pera Garden experience",
        "title": "Away from the rush, close to your celebration",
        "body": "Pera Garden brings open-air freshness, thoughtful service flow, and quiet elegance into one garden setting for ceremonies, dinners, and warm celebrations.",
        "highlights": [
          {
            "title": "Garden atmosphere",
            "description": "Natural light, greenery, and photo-friendly outdoor spaces."
          },
          {
            "title": "Smooth organization",
            "description": "Welcoming, ceremony, dinner, and celebration flow planned together."
          },
          {
            "title": "Intimate scale",
            "description": "A graceful setting that feels close and comfortable for your guests."
          }
        ]
      }
    }'::jsonb,
    now()
  ),
  (
    'slider',
    'draft',
    2,
    'tr',
    '{
      "tr": {
        "eyebrow": "Davet akışı",
        "title": "Gününüzü taşıyan küçük ama önemli anlar",
        "subtitle": "Pera Garden, hazırlık heyecanından son dansa kadar her adımı yalın ve anlaşılır bir akışla destekler.",
        "slides": [
          {
            "title": "Karşılama",
            "description": "Misafirleriniz bahçe atmosferine sakin, düzenli ve sıcak bir başlangıçla adım atar."
          },
          {
            "title": "Tören",
            "description": "Nikâh ve kutlama alanı, anın merkezinde kalmanız için sade bir düzenle hazırlanır."
          },
          {
            "title": "Kutlama",
            "description": "Yemek, müzik ve dans akışı davetlilerinizle doğal bir ritimde ilerler."
          }
        ]
      },
      "en": {
        "eyebrow": "Celebration flow",
        "title": "Small moments that carry the whole day",
        "subtitle": "From the first welcome to the last dance, Pera Garden supports each step with a clear and graceful flow.",
        "slides": [
          {
            "title": "Welcome",
            "description": "Guests step into the garden with a calm, organized, and warm first impression."
          },
          {
            "title": "Ceremony",
            "description": "The ceremony setting is prepared simply, keeping the moment at the center."
          },
          {
            "title": "Celebration",
            "description": "Dinner, music, and dancing move with a natural rhythm for your guests."
          }
        ]
      }
    }'::jsonb,
    null
  ),
  (
    'slider',
    'published',
    2,
    'tr',
    '{
      "tr": {
        "eyebrow": "Davet akışı",
        "title": "Gününüzü taşıyan küçük ama önemli anlar",
        "subtitle": "Pera Garden, hazırlık heyecanından son dansa kadar her adımı yalın ve anlaşılır bir akışla destekler.",
        "slides": [
          {
            "title": "Karşılama",
            "description": "Misafirleriniz bahçe atmosferine sakin, düzenli ve sıcak bir başlangıçla adım atar."
          },
          {
            "title": "Tören",
            "description": "Nikâh ve kutlama alanı, anın merkezinde kalmanız için sade bir düzenle hazırlanır."
          },
          {
            "title": "Kutlama",
            "description": "Yemek, müzik ve dans akışı davetlilerinizle doğal bir ritimde ilerler."
          }
        ]
      },
      "en": {
        "eyebrow": "Celebration flow",
        "title": "Small moments that carry the whole day",
        "subtitle": "From the first welcome to the last dance, Pera Garden supports each step with a clear and graceful flow.",
        "slides": [
          {
            "title": "Welcome",
            "description": "Guests step into the garden with a calm, organized, and warm first impression."
          },
          {
            "title": "Ceremony",
            "description": "The ceremony setting is prepared simply, keeping the moment at the center."
          },
          {
            "title": "Celebration",
            "description": "Dinner, music, and dancing move with a natural rhythm for your guests."
          }
        ]
      }
    }'::jsonb,
    now()
  )
on conflict (section_key, status) do nothing;
