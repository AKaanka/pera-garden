alter table public.site_content
  add column if not exists is_visible boolean not null default true;

alter table public.site_content
  drop constraint if exists site_content_section_key_check;

alter table public.site_content
  add constraint site_content_section_key_check
  check (
    section_key in ('hero', 'about', 'services', 'slider', 'location', 'faq')
    or section_key ~ '^custom_[a-z0-9_]{3,64}$'
  );

create index if not exists site_content_public_visible_order_idx
  on public.site_content (status, is_visible, order_index)
  where status = 'published' and is_visible = true;

drop policy if exists "Anonymous can read published site content" on public.site_content;

create policy "Anonymous can read visible published site content"
  on public.site_content for select to anon
  using (status = 'published' and is_visible = true);
