import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { sendWhatsappTemplate } from "../_shared/whatsapp.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const jwt = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({
      ok: false,
      code: "SERVER_CONFIG_ERROR",
      message: "WhatsApp retry is not configured yet.",
    }, 500);
  }

  if (!jwt) {
    return jsonResponse({
      ok: false,
      code: "UNAUTHORIZED",
      message: "Please sign in again.",
    }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data: userResult, error: userError } = await supabase.auth.getUser(jwt);

  if (userError || !userResult.user) {
    return jsonResponse({
      ok: false,
      code: "UNAUTHORIZED",
      message: "Please sign in again.",
    }, 401);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userResult.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) {
    return jsonResponse({
      ok: false,
      code: "FORBIDDEN",
      message: "Admin access is required.",
    }, 403);
  }

  const body = await request.json().catch(() => ({}));
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";

  if (!submissionId) {
    return jsonResponse({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Submission id is required.",
    }, 400);
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (submissionError || !submission) {
    return jsonResponse({
      ok: false,
      code: "NOT_FOUND",
      message: "Submission was not found.",
    }, 404);
  }

  const attemptNumber = (submission.whatsapp_attempt_count ?? 0) + 1;
  const whatsapp = await sendWhatsappTemplate(submission);
  const status = whatsapp.ok ? "sent" : "failed";

  await supabase.from("whatsapp_delivery_attempts").insert({
    submission_id: submission.id,
    attempt_number: attemptNumber,
    status,
    meta_message_id: whatsapp.ok ? whatsapp.messageId : null,
    meta_response: whatsapp.ok ? whatsapp.response : whatsapp.response ?? null,
    error_message: whatsapp.ok ? null : whatsapp.error,
  });

  await supabase
    .from("submissions")
    .update({
      whatsapp_status: status,
      whatsapp_message_id: whatsapp.ok ? whatsapp.messageId : submission.whatsapp_message_id,
      whatsapp_last_error: whatsapp.ok ? null : whatsapp.error,
      whatsapp_attempt_count: attemptNumber,
      whatsapp_last_attempt_at: new Date().toISOString(),
    })
    .eq("id", submission.id);

  return jsonResponse({
    ok: true,
    code: whatsapp.ok ? "WHATSAPP_RETRIED" : "WHATSAPP_RETRY_FAILED",
    submissionId: submission.id,
    whatsappStatus: status,
    message: whatsapp.ok ? "WhatsApp notification sent." : "WhatsApp retry failed.",
  }, whatsapp.ok ? 200 : 202);
});
