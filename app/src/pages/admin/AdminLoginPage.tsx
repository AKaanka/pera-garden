import { FormEvent, useState } from "react";
import { isSupabaseConfigured } from "../../services/supabase/client";
import { signInWithPassword } from "../../services/supabase/auth";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithPassword(email, password);
      window.history.pushState({}, "", "/admin/hero");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Pera Garden</p>
        <h1>Admin sign in</h1>

        {!isSupabaseConfigured ? (
          <p className="form-status is-error">Add Supabase values to app/.env.local.</p>
        ) : null}

        <label>
          Email
          <input
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? (
          <p className="form-status is-error" role="status">
            {error}
          </p>
        ) : null}

        <button className="primary-action form-button" disabled={submitting || !isSupabaseConfigured} type="submit">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
