-- Run this after creating the first owner in Supabase Auth.
-- It promotes the oldest Auth user to the single active MVP admin profile.
insert into public.profiles (id, email, is_active)
select id, email, true
from auth.users
order by created_at asc
limit 1
on conflict (id) do update
set
  email = excluded.email,
  is_active = true,
  updated_at = now();
