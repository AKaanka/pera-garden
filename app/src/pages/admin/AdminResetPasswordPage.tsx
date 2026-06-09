import { FormEvent, useState } from "react";
import { isSupabaseConfigured } from "../../services/supabase/client";
import { updatePassword } from "../../services/supabase/auth";

export function AdminResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await updatePassword(password);
      setStatus("Password updated. You can sign in with the new password.");
      setPassword("");
      setConfirmPassword("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Pera Garden</p>
        <h1>Set a new password</h1>
        <p className="admin-login-note">
          Open this page from the password reset email, then choose a new owner password.
        </p>

        {!isSupabaseConfigured ? (
          <p className="form-status is-error">Add Supabase values to app/.env.local.</p>
        ) : null}

        <label>
          New password
          <input
            autoComplete="new-password"
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label>
          Confirm new password
          <input
            autoComplete="new-password"
            minLength={8}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {submitting ? "Updating..." : "Update password"}
        </button>

        <a className="secondary-button form-button" href="/admin">
          Back to sign in
        </a>
      </form>
    </main>
  );
}
