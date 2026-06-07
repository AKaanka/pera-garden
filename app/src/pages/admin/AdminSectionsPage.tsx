import { useEffect, useState, type DragEvent } from "react";
import {
  deleteCustomSection,
  getAdminSectionRows,
  getSectionLabel,
  isBuiltInSectionKey,
  saveSectionOrder,
  saveSectionVisibility,
} from "../../services/supabase/content";
import type { SectionKey, SiteContentRow } from "../../types";

const unsavedOrderMessage = "You have unsaved section order changes. Leave without saving them?";

function moveRow(rows: SiteContentRow[], fromIndex: number, toIndex: number) {
  const nextRows = [...rows];
  const [moved] = nextRows.splice(fromIndex, 1);
  nextRows.splice(toIndex, 0, moved);
  return nextRows.map((row, index) => ({
    ...row,
    order_index: index,
  }));
}

function orderSummary(rows: SiteContentRow[]) {
  return rows.map((row) => getSectionLabel(row.section_key, row.content)).join(" -> ");
}

export function AdminSectionsPage() {
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [draggedKey, setDraggedKey] = useState<SectionKey | "">("");
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  const confirmUnsavedOrder = () => !hasUnsavedOrder || window.confirm(unsavedOrderMessage);

  const loadSections = async () => {
    setLoading(true);
    setStatus("");
    setStatusType("success");

    try {
      setRows(await getAdminSectionRows());
      setHasUnsavedOrder(false);
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not load sections.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSectionVisibility = async (row: SiteContentRow) => {
    const nextVisibility = !row.is_visible;
    setSaving(true);
    setStatus("");
    setStatusType("success");

    try {
      await saveSectionVisibility(row.section_key, nextVisibility);
      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.section_key === row.section_key
            ? {
                ...currentRow,
                is_visible: nextVisibility,
              }
            : currentRow,
        ),
      );
      setStatus(
        `${getSectionLabel(row.section_key, row.content)} ${
          nextVisibility ? "will be visible on the homepage." : "is kept in admin only."
        }`,
      );
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not update section visibility.");
    } finally {
      setSaving(false);
    }
  };

  const removeCustomSection = async (row: SiteContentRow) => {
    const label = getSectionLabel(row.section_key, row.content);

    if (isBuiltInSectionKey(row.section_key)) {
      setStatusType("error");
      setStatus("Built-in sections cannot be removed. Use Hide to keep one out of the homepage.");
      return;
    }

    if (!window.confirm(`Remove "${label}" from admin and the homepage?`)) {
      return;
    }

    setSaving(true);
    setStatus("");
    setStatusType("success");

    try {
      await deleteCustomSection(row.section_key);
      const nextRows = rows
        .filter((currentRow) => currentRow.section_key !== row.section_key)
        .map((currentRow, index) => ({
          ...currentRow,
          order_index: index,
        }));

      await saveSectionOrder(nextRows.map((currentRow) => currentRow.section_key));
      setRows(nextRows);
      setHasUnsavedOrder(false);
      setStatus(`${label} removed.`);
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not remove section.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  useEffect(() => {
    if (!hasUnsavedOrder) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = unsavedOrderMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedOrder]);

  useEffect(() => {
    if (!hasUnsavedOrder) {
      return undefined;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const navigationButton = target.closest("button[data-admin-navigation]");
      const anchor = target.closest("a");

      if (navigationButton) {
        if (!window.confirm(unsavedOrderMessage)) {
          event.preventDefault();
          event.stopPropagation();
        }

        return;
      }

      if (!anchor || anchor.target || anchor.origin !== window.location.origin) {
        return;
      }

      const nextUrl = new URL(anchor.href);

      if (nextUrl.pathname === window.location.pathname && nextUrl.hash === window.location.hash) {
        return;
      }

      if (!window.confirm(unsavedOrderMessage)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [hasUnsavedOrder]);

  const handleDragStart = (sectionKey: SectionKey) => {
    setDraggedKey(sectionKey);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, targetKey: SectionKey) => {
    event.preventDefault();

    if (!draggedKey || draggedKey === targetKey) {
      return;
    }

    setRows((currentRows) => {
      const fromIndex = currentRows.findIndex((row) => row.section_key === draggedKey);
      const toIndex = currentRows.findIndex((row) => row.section_key === targetKey);

      if (fromIndex < 0 || toIndex < 0) {
        return currentRows;
      }

      setHasUnsavedOrder(true);
      return moveRow(currentRows, fromIndex, toIndex);
    });
  };

  const moveSection = (sectionKey: SectionKey, direction: -1 | 1) => {
    setRows((currentRows) => {
      const fromIndex = currentRows.findIndex((row) => row.section_key === sectionKey);
      const toIndex = fromIndex + direction;

      if (fromIndex < 0 || toIndex < 0 || toIndex >= currentRows.length) {
        return currentRows;
      }

      setHasUnsavedOrder(true);
      return moveRow(currentRows, fromIndex, toIndex);
    });
  };

  const saveOrder = async () => {
    setSaving(true);
    setStatus("");
    setStatusType("success");

    try {
      await saveSectionOrder(rows.map((row) => row.section_key));
      setHasUnsavedOrder(false);
      setStatus(`Section order saved: ${orderSummary(rows)}.`);
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not save section order.");
    } finally {
      setSaving(false);
    }
  };

  const editSection = (sectionKey: SectionKey) => {
    if (!confirmUnsavedOrder()) {
      return;
    }

    window.location.href = `/admin/sections/${sectionKey}`;
  };

  if (loading) {
    return <div className="admin-panel">Loading sections...</div>;
  }

  return (
    <div className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <p className="eyebrow">Homepage</p>
          <h1>Sections</h1>
        </div>
        <button
          className="primary-action compact-action"
          disabled={saving || !hasUnsavedOrder}
          type="button"
          onClick={saveOrder}
        >
          {saving ? "Saving..." : "Save order"}
        </button>
      </header>

      {hasUnsavedOrder ? (
        <p className="form-status is-warning" role="status">
          Order changed. Save before opening another section to keep the new homepage order.
        </p>
      ) : null}

      <ol className="section-order-list" aria-label="Homepage section order">
        {rows.map((row, index) => (
          <li
            className="section-order-item"
            draggable
            key={row.section_key}
            onDragEnd={() => setDraggedKey("")}
            onDragOver={(event) => handleDragOver(event, row.section_key)}
            onDragStart={() => handleDragStart(row.section_key)}
          >
            <span className="drag-handle" aria-hidden="true">
              ::
            </span>
            <div>
              <h2>{getSectionLabel(row.section_key, row.content)}</h2>
              <p>
                Position {index + 1} of {rows.length} - {row.is_visible ? "Visible" : "Hidden"}
              </p>
            </div>
            <div className="section-order-actions">
              <button
                aria-label={`Move ${getSectionLabel(row.section_key, row.content)} up`}
                className="secondary-button compact-action"
                disabled={index === 0}
                type="button"
                onClick={() => moveSection(row.section_key, -1)}
              >
                Up
              </button>
              <button
                aria-label={`Move ${getSectionLabel(row.section_key, row.content)} down`}
                className="secondary-button compact-action"
                disabled={index === rows.length - 1}
                type="button"
                onClick={() => moveSection(row.section_key, 1)}
              >
                Down
              </button>
              <button
                className="secondary-button compact-action"
                disabled={saving}
                type="button"
                onClick={() => toggleSectionVisibility(row)}
              >
                {row.is_visible ? "Hide" : "Show"}
              </button>
              <button
                className="secondary-button compact-action"
                type="button"
                onClick={() => editSection(row.section_key)}
              >
                Edit
              </button>
              {!isBuiltInSectionKey(row.section_key) ? (
                <button
                  className="secondary-button compact-action"
                  disabled={saving}
                  type="button"
                  onClick={() => removeCustomSection(row)}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {status ? (
        <p className={`form-status is-${statusType}`} role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
