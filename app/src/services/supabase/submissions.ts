import type { Submission } from "../../types";
import { requireSupabaseClient } from "./client";

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

export async function retryWhatsapp(submissionId: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.functions.invoke("retry-whatsapp", {
    body: {
      submissionId,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
