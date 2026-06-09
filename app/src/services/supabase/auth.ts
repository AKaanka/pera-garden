import { requireSupabaseClient } from "./client";

export async function signInWithPassword(email: string, password: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset`,
  });

  if (error) {
    throw error;
  }
}

export async function updatePassword(password: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function checkActiveAdmin() {
  const supabase = requireSupabaseClient();
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return false;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userResult.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}
