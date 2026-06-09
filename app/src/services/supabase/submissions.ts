import type { RetryWhatsappResponse, Submission } from "../../types";
import { hasBooleanOk, parseFunctionError } from "../functionResponse";
import { requireSupabaseClient } from "./client";

function isRetryWhatsappResponse(value: unknown): value is RetryWhatsappResponse {
  return hasBooleanOk(value);
}

export async function listSubmissions(): Promise<Submission[]> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, first_name, last_name, phone, phone_normalized, message, locale, whatsapp_status, whatsapp_last_error, whatsapp_attempt_count, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []) as Submission[];
}

export async function retryWhatsapp(submissionId: string): Promise<RetryWhatsappResponse> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.functions.invoke<RetryWhatsappResponse>("retry-whatsapp", {
    body: {
      submissionId,
    },
  });

  if (error) {
    const functionResponse = await parseFunctionError(error, isRetryWhatsappResponse);

    if (functionResponse) {
      return functionResponse;
    }

    throw error;
  }

  if (!data) {
    throw new Error("No response from retry function.");
  }

  return data;
}

export async function deleteSubmission(submissionId: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.from("submissions").delete().eq("id", submissionId).select("id").maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("This submission was already removed or could not be found.");
  }
}

export async function deleteAllSubmissions(): Promise<number> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.from("submissions").delete().not("id", "is", null).select("id");

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}
