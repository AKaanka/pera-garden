import { FormEvent, useState } from "react";
import { isSupabaseConfigured } from "../../services/supabase/client";
import { requestPasswordReset, signInWithPassword } from "../../services/supabase/auth";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");
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

  const handlePasswordReset = async () => {
    setError("");
    setStatus("");

    if (!email) {
      setError("Enter the owner email first, then request a reset link.");
      return;
    }

    setResetting(true);

    try {
      await requestPasswordReset(email);
      setStatus("Password reset email sent if this owner account exists.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not send reset email.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Pera Garden</p>
        <h1>Admin sign in</h1>
        <p className="admin-login-note">
          Use the owner email and password created in Supabase Auth. Passwords cannot be viewed after creation.
        </p>

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

        {status ? (
          <p className="form-status is-success" role="status">
            {status}
          </p>
        ) : null}

        <button className="primary-action form-button" disabled={submitting || !isSupabaseConfigured} type="submit">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <button
          className="secondary-button form-button"
          disabled={resetting || submitting || !isSupabaseConfigured}
          type="button"
          onClick={handlePasswordReset}
        >
          {resetting ? "Sending..." : "Send password reset"}
        </button>
      </form>
    </main>
  );
}
