import { useEffect, useState } from "react";
import { listSubmissions, retryWhatsapp } from "../../services/supabase/submissions";
import type { Submission } from "../../types";

export function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [retryingId, setRetryingId] = useState("");

  const loadSubmissions = async () => {
    setLoading(true);

    try {
      setSubmissions(await listSubmissions());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const handleRetry = async (submissionId: string) => {
    setRetryingId(submissionId);
    setStatus("");

    try {
      await retryWhatsapp(submissionId);
      setStatus("WhatsApp retry requested.");
      await loadSubmissions();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Retry failed.");
    } finally {
      setRetryingId("");
    }
  };

  return (
    <div className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <p className="eyebrow">Contacts</p>
          <h1>Submissions</h1>
        </div>
        <button className="secondary-button" type="button" onClick={() => void loadSubmissions()}>
          Refresh
        </button>
      </header>

      {status ? (
        <p className="form-status is-success" role="status">
          {status}
        </p>
      ) : null}

      {loading ? <p>Loading submissions...</p> : null}

      {!loading && submissions.length === 0 ? <p>No submissions yet.</p> : null}

      <div className="submission-list">
        {submissions.map((submission) => (
          <article className="submission-card" key={submission.id}>
            <div>
              <h2>
                {submission.first_name} {submission.last_name}
              </h2>
              <p>{submission.phone_normalized}</p>
              <p>{submission.message}</p>
              {submission.whatsapp_last_error ? <p className="field-error">{submission.whatsapp_last_error}</p> : null}
            </div>
            <div className="submission-meta">
              <span className={`status-pill is-${submission.whatsapp_status}`}>{submission.whatsapp_status}</span>
              <time dateTime={submission.created_at}>{new Date(submission.created_at).toLocaleString()}</time>
              {submission.whatsapp_status === "failed" ? (
                <button
                  className="secondary-button"
                  disabled={retryingId === submission.id}
                  type="button"
                  onClick={() => void handleRetry(submission.id)}
                >
                  {retryingId === submission.id ? "Retrying..." : "Retry WhatsApp"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
