grant usage on schema app_private to service_role;
grant execute on function app_private.is_admin() to service_role;

grant select, insert, update, delete
  on public.profiles,
     public.site_content,
     public.submissions,
     public.contact_rate_limits,
     public.whatsapp_delivery_attempts
  to service_role;
