select
  id,
  first_name,
  last_name,
  phone_normalized,
  whatsapp_status,
  whatsapp_attempt_count,
  turnstile_success
from public.submissions
order by created_at desc
limit 3;
