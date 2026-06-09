import { useDeferredValue, useEffect, useState } from "react";
import { deleteAllSubmissions, deleteSubmission, listSubmissions, retryWhatsapp } from "../../services/supabase/submissions";
import type { Submission } from "../../types";

const submissionStatusOptions = ["all", "pending", "sent", "failed"] as const;

export function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "warning" | "error">("success");
  const [retryingId, setRetryingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof submissionStatusOptions)[number]>("all");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const loadSubmissions = async () => {
    setLoading(true);

    try {
      setSubmissions(await listSubmissions());
    } catch (error) {
      setStatusType("error");
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
      const response = await retryWhatsapp(submissionId);
      setStatus(response.message);
      setStatusType(response.ok ? (response.whatsappStatus === "sent" ? "success" : "warning") : "error");
      await loadSubmissions();
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Retry failed.");
    } finally {
      setRetryingId("");
    }
  };

  const handleDelete = async (submission: Submission) => {
    const fullName = `${submission.first_name} ${submission.last_name}`.trim();

    if (!window.confirm(`Delete ${fullName || submission.phone_normalized}'s submission permanently? This also removes its WhatsApp delivery history.`)) {
      return;
    }

    setDeletingId(submission.id);
    setStatus("");

    try {
      await deleteSubmission(submission.id);
      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setStatusType("success");
      setStatus("Submission deleted permanently. Related WhatsApp delivery attempts were removed too.");
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not delete submission.");
    } finally {
      setDeletingId("");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete every submission permanently? This also removes all WhatsApp delivery history.")) {
      return;
    }

    setDeletingAll(true);
    setStatus("");

    try {
      const deletedCount = await deleteAllSubmissions();
      setSubmissions([]);
      setStatusType("success");
      setStatus(
        deletedCount > 0
          ? `${deletedCount} submissions were deleted permanently. Related WhatsApp delivery attempts were removed too.`
          : "There were no submissions left to delete.",
      );
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not delete all submissions.");
    } finally {
      setDeletingAll(false);
    }
  };

  const normalizedQuery = deferredSearchQuery.trim().toLocaleLowerCase("tr");
  const filteredSubmissions = submissions.filter((submission) => {
    if (statusFilter !== "all" && submission.whatsapp_status !== statusFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      submission.first_name,
      submission.last_name,
      submission.phone_normalized,
      submission.message,
      submission.whatsapp_last_error ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase("tr");

    return haystack.includes(normalizedQuery);
  });
  const counts = {
    all: submissions.length,
    pending: submissions.filter((submission) => submission.whatsapp_status === "pending").length,
    sent: submissions.filter((submission) => submission.whatsapp_status === "sent").length,
    failed: submissions.filter((submission) => submission.whatsapp_status === "failed").length,
  };

  return (
    <div className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <p className="eyebrow">Contacts</p>
          <h1>Submissions</h1>
        </div>
        <div className="submission-header-actions">
          <button
            className="secondary-button submission-delete-button"
            disabled={loading || deletingAll || submissions.length === 0 || Boolean(retryingId) || Boolean(deletingId)}
            type="button"
            onClick={() => void handleDeleteAll()}
          >
            {deletingAll ? "Deleting all..." : "Delete all"}
          </button>
          <button
            className="secondary-button"
            disabled={deletingAll}
            type="button"
            onClick={() => void loadSubmissions()}
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="submission-toolbar" aria-label="Submission filters">
        <label className="submission-search">
          <span>Search</span>
          <input
            placeholder="Name, phone, message"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <div className="submission-filter-group" role="tablist" aria-label="Submission status">
          {submissionStatusOptions.map((option) => (
            <button
              aria-selected={statusFilter === option}
              className={statusFilter === option ? "is-active" : ""}
              key={option}
              role="tab"
              type="button"
              onClick={() => setStatusFilter(option)}
            >
              <span>{option === "all" ? "All" : option}</span>
              <strong>{counts[option]}</strong>
            </button>
          ))}
        </div>
      </section>

      {status ? (
        <p className={`form-status is-${statusType}`} role="status">
          {status}
        </p>
      ) : null}

      {loading ? <p>Loading submissions...</p> : null}

      {!loading && submissions.length === 0 ? <p>No submissions yet.</p> : null}

      {!loading && submissions.length > 0 && filteredSubmissions.length === 0 ? (
        <p>No submissions match the current search or status filter.</p>
      ) : null}

      <div className="submission-list">
        {filteredSubmissions.map((submission) => (
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
              <div className="submission-actions">
                {submission.whatsapp_status === "failed" ? (
                  <button
                    className="secondary-button"
                    disabled={retryingId === submission.id || deletingId === submission.id || deletingAll}
                    type="button"
                    onClick={() => void handleRetry(submission.id)}
                  >
                    {retryingId === submission.id ? "Retrying..." : "Retry WhatsApp"}
                  </button>
                ) : null}
                <button
                  className="secondary-button submission-delete-button"
                  disabled={retryingId === submission.id || deletingId === submission.id || deletingAll}
                  type="button"
                  onClick={() => void handleDelete(submission)}
                >
                  {deletingId === submission.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
