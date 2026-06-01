import { useEffect, useState, type ReactNode } from "react";
import {
  fallbackAboutContent,
  fallbackHeroContent,
  fallbackServicesContent,
  fallbackSliderContent,
  getAdminSectionRow,
  publishSection,
  saveSectionDraft,
  sectionLabels,
} from "../../services/supabase/content";
import type {
  AboutContent,
  AboutHighlight,
  HeroContent,
  Locale,
  ServicesContent,
  ServicesItem,
  SectionContentMap,
  SectionKey,
  SliderContent,
  SliderItem,
} from "../../types";

const locales: Locale[] = ["tr", "en"];

type AdminSectionEditorPageProps = {
  sectionKey: SectionKey;
};

const fallbackBySection: SectionContentMap = {
  hero: fallbackHeroContent,
  about: fallbackAboutContent,
  services: fallbackServicesContent,
  slider: fallbackSliderContent,
};

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

function HeroFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: HeroContent;
  setContent: (content: HeroContent) => void;
}) {
  const hero = content[activeLocale];

  const updateLocale = (field: keyof typeof hero, value: string) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...hero,
        [field]: value,
      },
    });
  };

  return (
    <>
      <Field label="Eyebrow">
        <input value={hero.eyebrow} onChange={(event) => updateLocale("eyebrow", event.target.value)} />
      </Field>
      <Field label="Title">
        <input value={hero.title} onChange={(event) => updateLocale("title", event.target.value)} />
      </Field>
      <Field label="Subtitle">
        <textarea rows={4} value={hero.subtitle} onChange={(event) => updateLocale("subtitle", event.target.value)} />
      </Field>
      <Field label="CTA label">
        <input value={hero.primaryCtaLabel} onChange={(event) => updateLocale("primaryCtaLabel", event.target.value)} />
      </Field>
      <Field label="CTA target">
        <input value={hero.primaryCtaHref} onChange={(event) => updateLocale("primaryCtaHref", event.target.value)} />
      </Field>
      <Field label="Hero image path">
        <input
          value={hero.image.path}
          onChange={(event) =>
            setContent({
              ...content,
              [activeLocale]: {
                ...hero,
                image: {
                  ...hero.image,
                  path: event.target.value,
                },
              },
            })
          }
        />
      </Field>
      <Field label="Image alt text">
        <input
          value={hero.image.alt}
          onChange={(event) =>
            setContent({
              ...content,
              [activeLocale]: {
                ...hero,
                image: {
                  ...hero.image,
                  alt: event.target.value,
                },
              },
            })
          }
        />
      </Field>
    </>
  );
}

function AboutFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: AboutContent;
  setContent: (content: AboutContent) => void;
}) {
  const about = content[activeLocale];

  const updateLocale = (field: keyof Omit<typeof about, "highlights">, value: string) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...about,
        [field]: value,
      },
    });
  };

  const updateHighlight = (index: number, field: keyof AboutHighlight, value: string) => {
    const highlights = [...about.highlights];
    highlights[index] = {
      ...highlights[index],
      [field]: value,
    };

    setContent({
      ...content,
      [activeLocale]: {
        ...about,
        highlights,
      },
    });
  };

  return (
    <>
      <Field label="Eyebrow">
        <input value={about.eyebrow} onChange={(event) => updateLocale("eyebrow", event.target.value)} />
      </Field>
      <Field label="Title">
        <input value={about.title} onChange={(event) => updateLocale("title", event.target.value)} />
      </Field>
      <Field label="Body">
        <textarea rows={5} value={about.body} onChange={(event) => updateLocale("body", event.target.value)} />
      </Field>
      <div className="editor-group">
        <h2>Highlights</h2>
        {about.highlights.map((highlight, index) => (
          <div className="editor-nested" key={`${highlight.title}-${index}`}>
            <Field label="Title">
              <input value={highlight.title} onChange={(event) => updateHighlight(index, "title", event.target.value)} />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={highlight.description}
                onChange={(event) => updateHighlight(index, "description", event.target.value)}
              />
            </Field>
          </div>
        ))}
      </div>
    </>
  );
}

function SliderFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: SliderContent;
  setContent: (content: SliderContent) => void;
}) {
  const slider = content[activeLocale];

  const updateLocale = (field: keyof Omit<typeof slider, "slides">, value: string) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...slider,
        [field]: value,
      },
    });
  };

  const updateSlide = (index: number, field: keyof SliderItem, value: string) => {
    const slides = [...slider.slides];
    slides[index] = {
      ...slides[index],
      [field]: value,
    };

    setContent({
      ...content,
      [activeLocale]: {
        ...slider,
        slides,
      },
    });
  };

  const addSlide = () => {
    const blankSlide =
      activeLocale === "tr"
        ? {
            title: "Yeni slayt",
            description: "Bu slayt için kısa bir açıklama yazın.",
          }
        : {
            title: "New slide",
            description: "Write a short description for this slide.",
          };

    setContent({
      ...content,
      [activeLocale]: {
        ...slider,
        slides: [...slider.slides, blankSlide],
      },
    });
  };

  const removeSlide = (index: number) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...slider,
        slides: slider.slides.filter((_slide, slideIndex) => slideIndex !== index),
      },
    });
  };

  return (
    <>
      <Field label="Eyebrow">
        <input value={slider.eyebrow} onChange={(event) => updateLocale("eyebrow", event.target.value)} />
      </Field>
      <Field label="Title">
        <input value={slider.title} onChange={(event) => updateLocale("title", event.target.value)} />
      </Field>
      <Field label="Subtitle">
        <textarea rows={4} value={slider.subtitle} onChange={(event) => updateLocale("subtitle", event.target.value)} />
      </Field>
      <div className="editor-group">
        <div className="editor-group-header">
          <h2>Slides</h2>
          <button className="secondary-button" type="button" onClick={addSlide}>
            Add slide
          </button>
        </div>
        {slider.slides.map((slide, index) => (
          <div className="editor-nested" key={`${slide.title}-${index}`}>
            <Field label="Title">
              <input value={slide.title} onChange={(event) => updateSlide(index, "title", event.target.value)} />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={slide.description}
                onChange={(event) => updateSlide(index, "description", event.target.value)}
              />
            </Field>
            {slider.slides.length > 1 ? (
              <button className="secondary-button" type="button" onClick={() => removeSlide(index)}>
                Remove slide
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

function ServicesFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: ServicesContent;
  setContent: (content: ServicesContent) => void;
}) {
  const services = content[activeLocale];

  const updateLocale = (field: keyof Omit<typeof services, "items">, value: string) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...services,
        [field]: value,
      },
    });
  };

  const updateItem = (index: number, field: keyof ServicesItem, value: string) => {
    const items = [...services.items];
    items[index] = {
      ...items[index],
      [field]: value,
    };

    setContent({
      ...content,
      [activeLocale]: {
        ...services,
        items,
      },
    });
  };

  const addItem = () => {
    const blankItem =
      activeLocale === "tr"
        ? {
            title: "Yeni hizmet",
            description: "Bu hizmet için kısa bir açıklama yazın.",
          }
        : {
            title: "New service",
            description: "Write a short description for this service.",
          };

    setContent({
      ...content,
      [activeLocale]: {
        ...services,
        items: [...services.items, blankItem],
      },
    });
  };

  const removeItem = (index: number) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...services,
        items: services.items.filter((_item, itemIndex) => itemIndex !== index),
      },
    });
  };

  return (
    <>
      <Field label="Eyebrow">
        <input value={services.eyebrow} onChange={(event) => updateLocale("eyebrow", event.target.value)} />
      </Field>
      <Field label="Title">
        <input value={services.title} onChange={(event) => updateLocale("title", event.target.value)} />
      </Field>
      <Field label="Subtitle">
        <textarea
          rows={4}
          value={services.subtitle}
          onChange={(event) => updateLocale("subtitle", event.target.value)}
        />
      </Field>
      <div className="editor-group">
        <div className="editor-group-header">
          <h2>Services</h2>
          <button className="secondary-button" type="button" onClick={addItem}>
            Add service
          </button>
        </div>
        {services.items.map((item, index) => (
          <div className="editor-nested" key={`${item.title}-${index}`}>
            <Field label="Title">
              <input value={item.title} onChange={(event) => updateItem(index, "title", event.target.value)} />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={item.description}
                onChange={(event) => updateItem(index, "description", event.target.value)}
              />
            </Field>
            {services.items.length > 1 ? (
              <button className="secondary-button" type="button" onClick={() => removeItem(index)}>
                Remove service
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

export function AdminSectionEditorPage({ sectionKey }: AdminSectionEditorPageProps) {
  const [content, setContent] = useState<SectionContentMap[SectionKey]>(fallbackBySection[sectionKey]);
  const [activeLocale, setActiveLocale] = useState<Locale>("tr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  useEffect(() => {
    let active = true;

    setLoading(true);
    getAdminSectionRow(sectionKey)
      .then((row) => {
        if (active) {
          setContent(row.content);
        }
      })
      .catch((error) => {
        setStatusType("error");
        setStatus(error instanceof Error ? error.message : "Could not load section.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [sectionKey]);

  const saveDraft = async () => {
    setSaving(true);
    setStatus("");
    setStatusType("success");

    try {
      await saveSectionDraft(sectionKey, content);
      setStatus("Draft saved.");
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not save draft.");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    setStatus("");
    setStatusType("success");

    try {
      await saveSectionDraft(sectionKey, content);
      await publishSection(sectionKey, content);
      setStatus("Section published.");
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not publish section.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-panel">Loading section...</div>;
  }

  return (
    <div className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <p className="eyebrow">Homepage</p>
          <h1>{sectionLabels[sectionKey]}</h1>
        </div>
        <div className="admin-actions">
          <a className="secondary-button" href="/admin/sections">
            All sections
          </a>
          <button className="secondary-button" disabled={saving} type="button" onClick={saveDraft}>
            Save draft
          </button>
          <button className="primary-action compact-action" disabled={saving} type="button" onClick={publish}>
            Publish
          </button>
        </div>
      </header>

      <div className="segmented-control" role="tablist" aria-label="Section locale">
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

      <form className="editor-form">
        {sectionKey === "hero" ? (
          <HeroFields
            activeLocale={activeLocale}
            content={content as HeroContent}
            setContent={(nextContent) => setContent(nextContent)}
          />
        ) : null}
        {sectionKey === "about" ? (
          <AboutFields
            activeLocale={activeLocale}
            content={content as AboutContent}
            setContent={(nextContent) => setContent(nextContent)}
          />
        ) : null}
        {sectionKey === "slider" ? (
          <SliderFields
            activeLocale={activeLocale}
            content={content as SliderContent}
            setContent={(nextContent) => setContent(nextContent)}
          />
        ) : null}
        {sectionKey === "services" ? (
          <ServicesFields
            activeLocale={activeLocale}
            content={content as ServicesContent}
            setContent={(nextContent) => setContent(nextContent)}
          />
        ) : null}
      </form>

      {status ? (
        <p className={`form-status is-${statusType}`} role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
