create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  ), false);
$$;

grant usage on schema app_private to anon, authenticated;
grant execute on function app_private.is_admin() to anon, authenticated;

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  section_key text not null check (section_key in ('hero')),
  status text not null check (status in ('draft', 'published')),
  order_index integer not null default 0,
  default_locale text not null default 'tr' check (default_locale in ('tr', 'en')),
  content jsonb not null default '{"tr": {}, "en": {}}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_content_section_status_unique unique (section_key, status),
  constraint site_content_locale_shape check (
    jsonb_typeof(content) = 'object'
    and content ? 'tr'
    and content ? 'en'
    and jsonb_typeof(content -> 'tr') = 'object'
    and jsonb_typeof(content -> 'en') = 'object'
  ),
  constraint site_content_published_has_timestamp check (
    status = 'draft' or published_at is not null
  )
);

create index site_content_public_order_idx
  on public.site_content (status, order_index)
  where status = 'published';

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(btrim(first_name)) between 1 and 80),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 80),
  phone text not null check (char_length(btrim(phone)) between 6 and 40),
  phone_normalized text not null check (phone_normalized ~ '^\+[1-9][0-9]{7,14}$'),
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  source_url text,
  user_agent text,
  ip_hash text,
  turnstile_success boolean not null default false,
  whatsapp_status text not null default 'pending'
    check (whatsapp_status in ('pending', 'sent', 'failed')),
  whatsapp_message_id text,
  whatsapp_last_error text,
  whatsapp_attempt_count integer not null default 0 check (whatsapp_attempt_count >= 0),
  whatsapp_last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_created_at_idx on public.submissions (created_at desc);
create index submissions_whatsapp_status_idx on public.submissions (whatsapp_status);
create index submissions_phone_normalized_idx on public.submissions (phone_normalized);

create table public.contact_rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('ip', 'phone')),
  key_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count >= 0),
  blocked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_rate_limits_unique_window unique (scope, key_hash, window_start)
);

create index contact_rate_limits_blocked_until_idx
  on public.contact_rate_limits (blocked_until)
  where blocked_until is not null;

create table public.whatsapp_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  status text not null check (status in ('pending', 'sent', 'failed')),
  meta_message_id text,
  meta_response jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  constraint whatsapp_delivery_attempts_unique_attempt
    unique (submission_id, attempt_number)
);

create index whatsapp_delivery_attempts_submission_idx
  on public.whatsapp_delivery_attempts (submission_id, created_at desc);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

create trigger set_submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

create trigger set_contact_rate_limits_updated_at
  before update on public.contact_rate_limits
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.submissions enable row level security;
alter table public.contact_rate_limits enable row level security;
alter table public.whatsapp_delivery_attempts enable row level security;

create policy "Admins can select profiles"
  on public.profiles for select to authenticated
  using ((select app_private.is_admin()));

create policy "Admins can insert profiles"
  on public.profiles for insert to authenticated
  with check ((select app_private.is_admin()));

create policy "Admins can update profiles"
  on public.profiles for update to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

create policy "Admins can delete profiles"
  on public.profiles for delete to authenticated
  using ((select app_private.is_admin()));

create policy "Anonymous can read published site content"
  on public.site_content for select to anon
  using (status = 'published' and published_at is not null);

create policy "Admins can select all site content"
  on public.site_content for select to authenticated
  using ((select app_private.is_admin()));

create policy "Admins can insert site content"
  on public.site_content for insert to authenticated
  with check ((select app_private.is_admin()));

create policy "Admins can update site content"
  on public.site_content for update to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

create policy "Admins can delete site content"
  on public.site_content for delete to authenticated
  using ((select app_private.is_admin()));

create policy "Admins can select submissions"
  on public.submissions for select to authenticated
  using ((select app_private.is_admin()));

create policy "Admins can insert submissions"
  on public.submissions for insert to authenticated
  with check ((select app_private.is_admin()));

create policy "Admins can update submissions"
  on public.submissions for update to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

create policy "Admins can delete submissions"
  on public.submissions for delete to authenticated
  using ((select app_private.is_admin()));

create policy "Admins can manage contact rate limits"
  on public.contact_rate_limits for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

create policy "Admins can manage WhatsApp attempts"
  on public.whatsapp_delivery_attempts for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

grant select on public.site_content to anon;
grant select, insert, update, delete
  on public.profiles,
     public.site_content,
     public.submissions,
     public.contact_rate_limits,
     public.whatsapp_delivery_attempts
  to authenticated;

grant usage on schema app_private to service_role;
grant execute on function app_private.is_admin() to service_role;

grant select, insert, update, delete
  on public.profiles,
     public.site_content,
     public.submissions,
     public.contact_rate_limits,
     public.whatsapp_delivery_attempts
  to service_role;

insert into storage.buckets (id, name, "public", file_size_limit, allowed_mime_types)
values
  ('hero', 'hero', true, 2097152, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
set
  "public" = excluded."public",
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read hero media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'hero');

create policy "Admins can insert hero media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'hero' and (select app_private.is_admin()));

create policy "Admins can update hero media"
  on storage.objects for update to authenticated
  using (bucket_id = 'hero' and (select app_private.is_admin()))
  with check (bucket_id = 'hero' and (select app_private.is_admin()));

create policy "Admins can delete hero media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'hero' and (select app_private.is_admin()));

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
    'hero',
    'draft',
    0,
    'tr',
    '{
      "tr": {
        "eyebrow": "Pera Garden",
        "title": "Dugununuz icin zamansiz bir bahce",
        "subtitle": "Sevdiklerinizle bir araya geleceginiz, fotograf gibi hatirlanan zarif bir acik hava davet alani.",
        "primaryCtaLabel": "Rezervasyon iste",
        "primaryCtaHref": "#contact",
        "image": {
          "bucket": "hero",
          "path": "",
          "alt": "Pera Garden dugun alani"
        }
      },
      "en": {
        "eyebrow": "Pera Garden",
        "title": "A timeless garden for your wedding",
        "subtitle": "An elegant outdoor venue for celebrations that feel intimate, warm, and beautifully remembered.",
        "primaryCtaLabel": "Request a reservation",
        "primaryCtaHref": "#contact",
        "image": {
          "bucket": "hero",
          "path": "",
          "alt": "Pera Garden wedding venue"
        }
      }
    }'::jsonb,
    null
  ),
  (
    'hero',
    'published',
    0,
    'tr',
    '{
      "tr": {
        "eyebrow": "Pera Garden",
        "title": "Dugununuz icin zamansiz bir bahce",
        "subtitle": "Sevdiklerinizle bir araya geleceginiz, fotograf gibi hatirlanan zarif bir acik hava davet alani.",
        "primaryCtaLabel": "Rezervasyon iste",
        "primaryCtaHref": "#contact",
        "image": {
          "bucket": "hero",
          "path": "",
          "alt": "Pera Garden dugun alani"
        }
      },
      "en": {
        "eyebrow": "Pera Garden",
        "title": "A timeless garden for your wedding",
        "subtitle": "An elegant outdoor venue for celebrations that feel intimate, warm, and beautifully remembered.",
        "primaryCtaLabel": "Request a reservation",
        "primaryCtaHref": "#contact",
        "image": {
          "bucket": "hero",
          "path": "",
          "alt": "Pera Garden wedding venue"
        }
      }
    }'::jsonb,
    now()
  )
on conflict (section_key, status) do nothing;
