alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (section_key in ('hero', 'about', 'services', 'slider', 'location', 'faq'));

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
    'faq',
    'draft',
    5,
    'tr',
    '{
      "tr": {
        "eyebrow": "Sık sorulan sorular",
        "title": "Planlama öncesi merak edilenler",
        "subtitle": "Davetiniz için ilk görüşmeden önce en çok sorulan başlıkları kısa ve net şekilde yanıtladık.",
        "items": [
          {
            "question": "Pera Garden hangi tür davetler için uygundur?",
            "answer": "Düğün, nişan, nikâh sonrası kutlama ve özel davetler için açık hava odaklı bir akış planlanabilir."
          },
          {
            "question": "Organizasyon akışı birlikte planlanıyor mu?",
            "answer": "Evet. Karşılama, tören, yemek, müzik ve kutlama akışı davet beklentinize göre birlikte netleştirilir."
          },
          {
            "question": "Detaylı bilgi ve uygun tarih için nasıl iletişime geçilir?",
            "answer": "Formu doldurduğunuzda ekip size dönüş yapar ve tarih, kişi sayısı, ihtiyaçlar gibi detayları birlikte konuşur."
          }
        ]
      },
      "en": {
        "eyebrow": "FAQ",
        "title": "Questions before planning",
        "subtitle": "A short set of answers for the topics couples usually ask before the first conversation.",
        "items": [
          {
            "question": "What kind of events is Pera Garden suitable for?",
            "answer": "The venue can support weddings, engagements, post-ceremony celebrations, and private outdoor gatherings."
          },
          {
            "question": "Is the event flow planned together?",
            "answer": "Yes. Welcome, ceremony, dinner, music, and celebration flow are shaped around your expectations."
          },
          {
            "question": "How can we ask about details and available dates?",
            "answer": "Send the form and the team will follow up to discuss date, guest count, and event needs."
          }
        ]
      }
    }'::jsonb,
    null
  ),
  (
    'faq',
    'published',
    5,
    'tr',
    '{
      "tr": {
        "eyebrow": "Sık sorulan sorular",
        "title": "Planlama öncesi merak edilenler",
        "subtitle": "Davetiniz için ilk görüşmeden önce en çok sorulan başlıkları kısa ve net şekilde yanıtladık.",
        "items": [
          {
            "question": "Pera Garden hangi tür davetler için uygundur?",
            "answer": "Düğün, nişan, nikâh sonrası kutlama ve özel davetler için açık hava odaklı bir akış planlanabilir."
          },
          {
            "question": "Organizasyon akışı birlikte planlanıyor mu?",
            "answer": "Evet. Karşılama, tören, yemek, müzik ve kutlama akışı davet beklentinize göre birlikte netleştirilir."
          },
          {
            "question": "Detaylı bilgi ve uygun tarih için nasıl iletişime geçilir?",
            "answer": "Formu doldurduğunuzda ekip size dönüş yapar ve tarih, kişi sayısı, ihtiyaçlar gibi detayları birlikte konuşur."
          }
        ]
      },
      "en": {
        "eyebrow": "FAQ",
        "title": "Questions before planning",
        "subtitle": "A short set of answers for the topics couples usually ask before the first conversation.",
        "items": [
          {
            "question": "What kind of events is Pera Garden suitable for?",
            "answer": "The venue can support weddings, engagements, post-ceremony celebrations, and private outdoor gatherings."
          },
          {
            "question": "Is the event flow planned together?",
            "answer": "Yes. Welcome, ceremony, dinner, music, and celebration flow are shaped around your expectations."
          },
          {
            "question": "How can we ask about details and available dates?",
            "answer": "Send the form and the team will follow up to discuss date, guest count, and event needs."
          }
        ]
      }
    }'::jsonb,
    now()
  )
on conflict (section_key, status) do nothing;
