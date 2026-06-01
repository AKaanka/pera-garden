-- Run after supabase/migrations/20260528204211_mvp_vertical_slice.sql.
-- These queries should return rows that confirm the MVP backend exists.

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'site_content',
    'submissions',
    'contact_rate_limits',
    'whatsapp_delivery_attempts'
  )
order by table_name;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'site_content',
    'submissions',
    'contact_rate_limits',
    'whatsapp_delivery_attempts'
  )
order by tablename;

select section_key, status, default_locale, content ? 'tr' as has_tr, content ? 'en' as has_en
from public.site_content
where section_key = 'hero'
order by status;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'hero';

select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'site_content',
    'submissions',
    'contact_rate_limits',
    'whatsapp_delivery_attempts'
  )
order by tablename, policyname;
