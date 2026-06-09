import type { ContactFormPayload, ContactFormResponse } from "../types";
import { hasBooleanOk, parseFunctionError } from "./functionResponse";
import { requireSupabaseClient } from "./supabase/client";

function isContactFormResponse(value: unknown): value is ContactFormResponse {
  return hasBooleanOk(value);
}

export async function submitContactForm(
  payload: ContactFormPayload,
): Promise<ContactFormResponse> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.functions.invoke<ContactFormResponse>("submit-contact", {
    body: payload,
  });

  if (error) {
    const functionResponse = await parseFunctionError(error, isContactFormResponse);

    if (functionResponse) {
      return functionResponse;
    }

    throw error;
  }

  if (!data) {
    throw new Error("No response from contact function.");
  }

  return data;
}
