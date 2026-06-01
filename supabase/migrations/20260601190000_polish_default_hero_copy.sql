update public.site_content
set
  content = jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{tr,title}',
        to_jsonb('Düğününüz için zamansız bir bahçe'::text)
      ),
      '{tr,subtitle}',
      to_jsonb('Sevdiklerinizle bir araya geleceğiniz, fotoğraf gibi hatırlanan zarif bir açık hava davet alanı.'::text)
    ),
    '{tr,image,alt}',
    to_jsonb('Pera Garden düğün alanı'::text)
  )
where section_key = 'hero'
  and content #>> '{tr,title}' = 'Dugununuz icin zamansiz bir bahce';
