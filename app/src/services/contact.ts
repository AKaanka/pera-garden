import type { ContactFormPayload, ContactFormResponse } from "../types";
import { requireSupabaseClient } from "./supabase/client";

export async function submitContactForm(
  payload: ContactFormPayload,
): Promise<ContactFormResponse> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.functions.invoke<ContactFormResponse>("submit-contact", {
    body: payload,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No response from contact function.");
  }

  return data;
}
