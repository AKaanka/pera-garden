create index if not exists site_content_created_by_idx
  on public.site_content (created_by);

create index if not exists site_content_updated_by_idx
  on public.site_content (updated_by);

create index if not exists site_content_published_by_idx
  on public.site_content (published_by);
