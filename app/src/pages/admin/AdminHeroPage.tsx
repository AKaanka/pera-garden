import { useEffect, useState } from "react";
import {
  fallbackHeroContent,
  getAdminHeroRows,
  publishHero,
  saveHeroDraft,
} from "../../services/supabase/content";
import type { HeroContent, Locale } from "../../types";

const locales: Locale[] = ["tr", "en"];

export function AdminHeroPage() {
  const [content, setContent] = useState<HeroContent>(fallbackHeroContent);
  const [activeLocale, setActiveLocale] = useState<Locale>("tr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const hero = content[activeLocale];

  useEffect(() => {
    let active = true;

    getAdminHeroRows()
      .then(({ draft }) => {
        if (active && draft) {
          setContent(draft.content);
        }
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "Could not load hero.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const updateLocale = (field: keyof typeof hero, value: string) => {
    setContent((current) => ({
      ...current,
      [activeLocale]: {
        ...current[activeLocale],
        [field]: value,
      },
    }));
  };

  const saveDraft = async () => {
    setSaving(true);
    setStatus("");

    try {
      await saveHeroDraft(content);
      setStatus("Draft saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save draft.");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    setStatus("");

    try {
      await saveHeroDraft(content);
      await publishHero(content);
      setStatus("Hero published.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not publish hero.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-panel">Loading hero...</div>;
  }

  return (
    <div className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <p className="eyebrow">Homepage</p>
          <h1>Hero</h1>
        </div>
        <div className="admin-actions">
          <button className="secondary-button" disabled={saving} type="button" onClick={saveDraft}>
            Save draft
          </button>
          <button className="primary-action compact-action" disabled={saving} type="button" onClick={publish}>
            Publish
          </button>
        </div>
      </header>

      <div className="segmented-control" role="tablist" aria-label="Hero locale">
        {locales.map((locale) => (
          <button
            aria-selected={activeLocale === locale}
            className={activeLocale === locale ? "is-active" : ""}
            key={locale}
            role="tab"
            type="button"
            onClick={() => setActiveLocale(locale)}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="admin-grid">
        <form className="editor-form">
          <label>
            Eyebrow
            <input value={hero.eyebrow} onChange={(event) => updateLocale("eyebrow", event.target.value)} />
          </label>

          <label>
            Title
            <input value={hero.title} onChange={(event) => updateLocale("title", event.target.value)} />
          </label>

          <label>
            Subtitle
            <textarea rows={4} value={hero.subtitle} onChange={(event) => updateLocale("subtitle", event.target.value)} />
          </label>

          <label>
            CTA label
            <input
              value={hero.primaryCtaLabel}
              onChange={(event) => updateLocale("primaryCtaLabel", event.target.value)}
            />
          </label>

          <label>
            CTA target
            <input
              value={hero.primaryCtaHref}
              onChange={(event) => updateLocale("primaryCtaHref", event.target.value)}
            />
          </label>

          <label>
            Hero image path
            <input
              value={hero.image.path}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  [activeLocale]: {
                    ...current[activeLocale],
                    image: {
                      ...current[activeLocale].image,
                      path: event.target.value,
                    },
                  },
                }))
              }
            />
          </label>

          <label>
            Image alt text
            <input
              value={hero.image.alt}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  [activeLocale]: {
                    ...current[activeLocale],
                    image: {
                      ...current[activeLocale].image,
                      alt: event.target.value,
                    },
                  },
                }))
              }
            />
          </label>
        </form>

        <div className="admin-preview">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h2>{hero.title}</h2>
          <p>{hero.subtitle}</p>
          <span>{hero.primaryCtaLabel}</span>
        </div>
      </div>

      {status ? (
        <p className="form-status is-success" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
