import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { parsePhoneNumberFromString } from "https://esm.sh/libphonenumber-js@1.11.20/min";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { sendWhatsappTemplate } from "../_shared/whatsapp.ts";

type ContactRequest = {
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  message?: unknown;
  locale?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
};

type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds?: number;
};

const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function windowStart(windowMs: number): string {
  return new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET");

  if (!secret) {
    return Deno.env.get("ALLOW_MISSING_TURNSTILE") === "true";
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => null);
  return Boolean(result?.success);
}

async function cleanupRateLimits(supabase: ReturnType<typeof createClient>) {
  const cutoff = new Date(Date.now() - 24 * ONE_HOUR_MS).toISOString();

  await supabase
    .from("contact_rate_limits")
    .delete()
    .lt("window_start", cutoff);
}

async function enforceRateLimit(
  supabase: ReturnType<typeof createClient>,
  scope: "ip" | "phone",
  keyHash: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const start = windowStart(windowMs);
  const windowEnd = new Date(new Date(start).getTime() + windowMs).getTime();

  const { data, error } = await supabase
    .from("contact_rate_limits")
    .select("id, request_count, blocked_until")
    .eq("scope", scope)
    .eq("key_hash", keyHash)
    .eq("window_start", start)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from("contact_rate_limits")
      .insert({
        scope,
        key_hash: keyHash,
        window_start: start,
        request_count: 1,
      });

    if (insertError) {
      throw insertError;
    }

    return { limited: false };
  }

  if (data.blocked_until && new Date(data.blocked_until).getTime() > now) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((new Date(data.blocked_until).getTime() - now) / 1000),
    };
  }

  const requestCount = data.request_count + 1;
  const blockedUntil = requestCount > maxRequests ? new Date(windowEnd).toISOString() : null;

  const { error: updateError } = await supabase
    .from("contact_rate_limits")
    .update({
      request_count: requestCount,
      blocked_until: blockedUntil,
    })
    .eq("id", data.id);

  if (updateError) {
    throw updateError;
  }

  if (blockedUntil) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((windowEnd - now) / 1000),
    };
  }

  return { limited: false };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({
      ok: false,
      code: "SERVER_CONFIG_ERROR",
      message: "The contact form is not configured yet.",
    }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const body = await request.json().catch((): ContactRequest => ({}));
  const ip = getClientIp(request);
  const fields: Record<string, string> = {};

  if (cleanText(body.website)) {
    return jsonResponse({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Please check the highlighted fields.",
      fields: {
        form: "Request rejected.",
      },
    }, 400);
  }

  const firstName = cleanText(body.firstName);
  const lastName = cleanText(body.lastName);
  const phone = cleanText(body.phone);
  const message = cleanText(body.message);
  const locale = cleanText(body.locale) === "en" ? "en" : "tr";
  const turnstileToken = cleanText(body.turnstileToken);

  if (!firstName || firstName.length > 80) {
    fields.firstName = "Enter a first name.";
  }

  if (!lastName || lastName.length > 80) {
    fields.lastName = "Enter a last name.";
  }

  const phoneNumber = parsePhoneNumberFromString(phone, "TR");
  const phoneNormalized = phoneNumber?.isValid() ? phoneNumber.number : "";

  if (!phoneNormalized) {
    fields.phone = "Enter a valid phone number.";
  }

  if (!message || message.length > 2000) {
    fields.message = "Enter a message up to 2000 characters.";
  }

  if (Object.keys(fields).length > 0) {
    return jsonResponse({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Please check the highlighted fields.",
      fields,
    }, 400);
  }

  try {
    await cleanupRateLimits(supabase);

    const pepper = Deno.env.get("RATE_LIMIT_PEPPER");

    if (!pepper) {
      return jsonResponse({
        ok: false,
        code: "SERVER_CONFIG_ERROR",
        message: "The contact form is not configured yet.",
      }, 500);
    }

    const ipHash = await sha256(`${pepper}:ip:${ip}`);
    const phoneHash = await sha256(`${pepper}:phone:${phoneNormalized}`);

    const ipLimit = await enforceRateLimit(supabase, "ip", ipHash, 5, TEN_MINUTES_MS);
    const phoneLimit = await enforceRateLimit(supabase, "phone", phoneHash, 3, ONE_HOUR_MS);
    const activeLimit = ipLimit.limited ? ipLimit : phoneLimit;

    if (activeLimit.limited) {
      return jsonResponse({
        ok: false,
        code: "RATE_LIMITED",
        message: "Please wait a few minutes before trying again.",
        retryAfterSeconds: activeLimit.retryAfterSeconds ?? 600,
      }, 429);
    }

    const turnstileOk = await verifyTurnstile(turnstileToken, ip);

    if (!turnstileOk) {
      return jsonResponse({
        ok: false,
        code: "TURNSTILE_FAILED",
        message: "We could not verify the request. Please try again.",
      }, 403);
    }

    const { data: submission, error: insertError } = await supabase
      .from("submissions")
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone,
        phone_normalized: phoneNormalized,
        message,
        locale,
        source_url: request.headers.get("referer"),
        user_agent: request.headers.get("user-agent"),
        ip_hash: ipHash,
        turnstile_success: true,
        whatsapp_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const whatsapp = await sendWhatsappTemplate(submission);
    const attemptStatus = whatsapp.ok ? "sent" : "failed";
    const nextAttempt = 1;

    await supabase.from("whatsapp_delivery_attempts").insert({
      submission_id: submission.id,
      attempt_number: nextAttempt,
      status: attemptStatus,
      meta_message_id: whatsapp.ok ? whatsapp.messageId : null,
      meta_response: whatsapp.ok ? whatsapp.response : whatsapp.response ?? null,
      error_message: whatsapp.ok ? null : whatsapp.error,
    });

    await supabase
      .from("submissions")
      .update({
        whatsapp_status: attemptStatus,
        whatsapp_message_id: whatsapp.ok ? whatsapp.messageId : null,
        whatsapp_last_error: whatsapp.ok ? null : whatsapp.error,
        whatsapp_attempt_count: nextAttempt,
        whatsapp_last_attempt_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    if (!whatsapp.ok) {
      return jsonResponse({
        ok: true,
        code: "WHATSAPP_QUEUED_RETRY",
        submissionId: submission.id,
        whatsappStatus: "failed",
        message: "Thanks! Your request was received.",
      }, 202);
    }

    return jsonResponse({
      ok: true,
      code: "SUBMITTED",
      submissionId: submission.id,
      whatsappStatus: "sent",
      message: "Thanks! We'll reach out on WhatsApp shortly.",
    });
  } catch (error) {
    console.error(error);

    return jsonResponse({
      ok: false,
      code: "SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    }, 500);
  }
});
