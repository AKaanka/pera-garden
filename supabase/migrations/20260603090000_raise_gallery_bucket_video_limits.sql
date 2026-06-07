update storage.buckets
set
  file_size_limit = 1073741824,
  allowed_mime_types = array[
    'image/webp',
    'image/jpeg',
    'image/png',
    'image/avif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
where id = 'gallery';
