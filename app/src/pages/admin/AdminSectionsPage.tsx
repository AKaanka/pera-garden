import { useEffect, useState, type DragEvent } from "react";
import { getAdminSectionRows, saveSectionOrder, sectionLabels } from "../../services/supabase/content";
import type { SectionKey, SiteContentRow } from "../../types";

function moveRow(rows: SiteContentRow[], fromIndex: number, toIndex: number) {
  const nextRows = [...rows];
  const [moved] = nextRows.splice(fromIndex, 1);
  nextRows.splice(toIndex, 0, moved);
  return nextRows.map((row, index) => ({
    ...row,
    order_index: index,
  }));
}

export function AdminSectionsPage() {
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [draggedKey, setDraggedKey] = useState<SectionKey | "">("");
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

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

  useEffect(() => {
    void loadSections();
  }, []);

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
      setStatus("Section order saved.");
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not save section order.");
    } finally {
      setSaving(false);
    }
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
          Order changed. Save to update the public page.
        </p>
      ) : null}

      <div className="section-order-list" aria-label="Homepage section order">
        {rows.map((row, index) => (
          <article
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
              <h2>{sectionLabels[row.section_key]}</h2>
              <p>Position {row.order_index + 1}</p>
            </div>
            <div className="section-order-actions">
              <button
                className="secondary-button compact-action"
                disabled={index === 0}
                type="button"
                onClick={() => moveSection(row.section_key, -1)}
              >
                Up
              </button>
              <button
                className="secondary-button compact-action"
                disabled={index === rows.length - 1}
                type="button"
                onClick={() => moveSection(row.section_key, 1)}
              >
                Down
              </button>
              <a className="secondary-button compact-action" href={`/admin/sections/${row.section_key}`}>
                Edit
              </a>
            </div>
          </article>
        ))}
      </div>

      {status ? (
        <p className={`form-status is-${statusType}`} role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
