import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  fallbackAboutContent,
  fallbackChromeContent,
  fallbackContactContent,
  fallbackFaqContent,
  fallbackGalleryContent,
  fallbackHeroContent,
  fallbackLocationContent,
  fallbackServicesContent,
  fallbackSliderContent,
  getAdminSectionRow,
  getPublicImageUrl,
  getSectionLabel,
  isBuiltInSectionKey,
  publishSection,
  saveSectionDraft,
} from "../../services/supabase/content";
import { isLocalMediaPath, resolveLocalMediaUrl } from "../../services/supabase/localMedia";
import { uploadHeroImage, uploadServiceImage } from "../../services/supabase/storage";
import { deleteGalleryMedia, uploadGalleryMedia } from "../../services/supabase/storage";
import { translateTurkishContentToEnglish } from "../../services/supabase/translation";
import { About } from "../../sections/About";
import { ContactForm } from "../../sections/ContactForm";
import { CustomSection } from "../../sections/CustomSection";
import { Faq } from "../../sections/Faq";
import { Gallery } from "../../sections/Gallery";
import { Hero } from "../../sections/Hero";
import { Location } from "../../sections/Location";
import { Services } from "../../sections/Services";
import { Slider } from "../../sections/Slider";
import type {
  AboutContent,
  AboutHighlight,
  AnySectionContent,
  BuiltInSectionKey,
  ChromeContent,
  ChromeNavItem,
  ContactContent,
  CustomContent,
  FaqContent,
  FaqItem,
  GalleryContent,
  GalleryItem,
  HeroContent,
  LocationContent,
  Locale,
  LocalizedContent,
  ServicesContent,
  ServicesItem,
  SectionContentMap,
  SectionKey,
  SliderContent,
  SliderItem,
  TextStyle,
  TextStyleMap,
} from "../../types";
import { DEFAULT_TEXT_STYLE, getTextStyle, resetTextStyleMap, updateTextStyleMap } from "../../utils/textStyles";

const locales: Locale[] = ["tr", "en"];
const isLocalDev = Boolean(import.meta.env.DEV && typeof window !== "undefined");

type AdminSectionEditorPageProps = {
  sectionKey: SectionKey;
};

const fallbackBySection: Record<BuiltInSectionKey, SectionContentMap[BuiltInSectionKey]> = {
  chrome: fallbackChromeContent,
  hero: fallbackHeroContent,
  about: fallbackAboutContent,
  services: fallbackServicesContent,
  gallery: fallbackGalleryContent,
  slider: fallbackSliderContent,
  location: fallbackLocationContent,
  faq: fallbackFaqContent,
  contact: fallbackContactContent,
};

const fallbackCustomContent: CustomContent = {
  tr: {
    eyebrow: "Yeni bölüm",
    title: "Yeni bölüm",
    body: "Bu bölüm için içerik yazın.",
    primaryCtaLabel: "Rezervasyon",
    primaryCtaHref: "#contact",
  },
  en: {
    eyebrow: "New section",
    title: "New section",
    body: "Write content for this section.",
    primaryCtaLabel: "Book Now",
    primaryCtaHref: "#contact",
  },
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

type StylableLocaleContent = {
  textStyles?: TextStyleMap;
};

function createLocaleEditor<TLocale extends StylableLocaleContent>({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: LocalizedContent<TLocale>;
  setContent: (content: LocalizedContent<TLocale>) => void;
}) {
  const localeContent = content[activeLocale];

  const updateLocaleField = <TField extends keyof TLocale>(field: TField, value: TLocale[TField]) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...localeContent,
        [field]: value,
      },
    });
  };

  const updateStyle = (fieldKey: string, patch: Partial<TextStyle>) => {
    setContent({
      ...content,
      [activeLocale]: updateTextStyleMap(localeContent, fieldKey, patch),
    });
  };

  const resetStyle = (fieldKey: string) => {
    setContent({
      ...content,
      [activeLocale]: resetTextStyleMap(localeContent, fieldKey),
    });
  };

  const copyStyle = (fieldKey: string) => {
    const targetLocale: Locale = activeLocale === "tr" ? "en" : "tr";
    const sourceStyle = localeContent.textStyles?.[fieldKey];

    setContent({
      ...content,
      [targetLocale]: sourceStyle
        ? updateTextStyleMap(content[targetLocale], fieldKey, sourceStyle)
        : resetTextStyleMap(content[targetLocale], fieldKey),
    });
  };

  return {
    copyStyle,
    localeContent,
    resetStyle,
    updateLocaleField,
    updateStyle,
  };
}

const fontFamilyOptions: Array<{ label: string; value: NonNullable<TextStyle["fontFamily"]> }> = [
  { label: "Default", value: "inherit" },
  { label: "Elegant Serif", value: "serif" },
  { label: "Garamond", value: "garamond" },
  { label: "Classic Times", value: "times" },
  { label: "Clean Sans", value: "sans" },
  { label: "Modern Sans", value: "modernSans" },
  { label: "Editorial Display", value: "displaySerif" },
  { label: "Roman Display", value: "romanDisplay" },
  { label: "Script", value: "script" },
  { label: "Handwritten", value: "handwritten" },
  { label: "Monospace", value: "mono" },
];

function describeStyle(styleValue?: TextStyle) {
  const parts: string[] = [];

  if (typeof styleValue?.fontSize === "number") {
    parts.push(`${styleValue.fontSize}px`);
  }

  if (styleValue?.fontFamily && styleValue.fontFamily !== "inherit") {
    parts.push(styleValue.fontFamily);
  }

  if (styleValue?.isBold) {
    parts.push("bold");
  }

  if (styleValue?.isItalic) {
    parts.push("italic");
  }

  if (styleValue?.color && styleValue.color !== DEFAULT_TEXT_STYLE.color) {
    parts.push(styleValue.color);
  }

  return parts.length > 0 ? parts.join(" · ") : "Default";
}

function TextStyleControls({
  activeLocale,
  onCopy,
  onReset,
  styleValue,
  onChange,
}: {
  activeLocale: Locale;
  onCopy: () => void;
  onReset: () => void;
  styleValue?: TextStyle;
  onChange: (patch: Partial<TextStyle>) => void;
}) {
  const targetLocale = activeLocale === "tr" ? "EN" : "TR";
  const [fontSizeDraft, setFontSizeDraft] = useState(
    typeof styleValue?.fontSize === "number" ? String(styleValue.fontSize) : "",
  );

  useEffect(() => {
    setFontSizeDraft(typeof styleValue?.fontSize === "number" ? String(styleValue.fontSize) : "");
  }, [styleValue?.fontSize]);

  return (
    <details className="text-style-disclosure">
      <summary className="text-style-summary">
        <span className="text-style-summary-label">Style</span>
        <span className="text-style-summary-value">{describeStyle(styleValue)}</span>
      </summary>
      <div className="text-style-controls">
        <div className="text-style-controls-header">
          <p className="text-style-defaults">
            Default: family {DEFAULT_TEXT_STYLE.fontFamily}, color {DEFAULT_TEXT_STYLE.color}, bold off, italic off
          </p>
          <div className="text-style-actions">
            <button className="secondary-button compact-action" type="button" onClick={onCopy}>
              Copy to {targetLocale}
            </button>
            <button className="secondary-button compact-action" type="button" onClick={onReset}>
              Reset
            </button>
          </div>
        </div>
        <div className="text-style-row">
          <Field label="Size">
            <input
              max={120}
              min={10}
              step={1}
              type="number"
              value={fontSizeDraft}
              placeholder="Default"
              onBlur={() => {
                if (!fontSizeDraft) {
                  onChange({ fontSize: undefined });
                  return;
                }

                const nextSize = Number(fontSizeDraft);

                if (Number.isFinite(nextSize)) {
                  const savedSize = Math.min(120, Math.max(10, nextSize));
                  setFontSizeDraft(String(savedSize));
                  onChange({ fontSize: savedSize });
                }
              }}
              onChange={(event) => {
                const nextValue = event.target.value;
                setFontSizeDraft(nextValue);

                if (!nextValue) {
                  onChange({ fontSize: undefined });
                  return;
                }

                const nextSize = Number(nextValue);

                if (Number.isFinite(nextSize) && nextSize >= 10 && nextSize <= 120) {
                  onChange({ fontSize: nextSize });
                }
              }}
            />
          </Field>
          <Field label="Family">
            <select
              value={styleValue?.fontFamily ?? "inherit"}
              onChange={(event) =>
                onChange({
                  fontFamily: event.target.value as NonNullable<TextStyle["fontFamily"]>,
                })
              }
            >
              {fontFamilyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Color">
            <input
              type="color"
              value={styleValue?.color ?? DEFAULT_TEXT_STYLE.color}
              onChange={(event) =>
                onChange({
                  color: event.target.value,
                })
              }
            />
          </Field>
        </div>
        <div className="text-style-toggle-row">
          <label className="text-style-toggle">
            <input
              checked={Boolean(styleValue?.isBold)}
              type="checkbox"
              onChange={(event) =>
                onChange({
                  isBold: event.target.checked,
                })
              }
            />
            <span>B</span>
          </label>
          <label className="text-style-toggle">
            <input
              checked={Boolean(styleValue?.isItalic)}
              type="checkbox"
              onChange={(event) =>
                onChange({
                  isItalic: event.target.checked,
                })
              }
            />
            <span>I</span>
          </label>
        </div>
      </div>
    </details>
  );
}

function StylableField({
  activeLocale,
  fieldKey,
  label,
  localeContent,
  multiline = false,
  onCopyStyle,
  onResetStyle,
  onStyleChange,
  onValueChange,
  rows = 4,
  value,
}: {
  activeLocale: Locale;
  fieldKey: string;
  label: string;
  localeContent: StylableLocaleContent;
  multiline?: boolean;
  onCopyStyle: (fieldKey: string) => void;
  onResetStyle: (fieldKey: string) => void;
  onStyleChange: (fieldKey: string, patch: Partial<TextStyle>) => void;
  onValueChange: (value: string) => void;
  rows?: number;
  value: string;
}) {
  return (
    <div className="stylable-field">
      <Field label={label}>
        {multiline ? (
          <textarea rows={rows} value={value} onChange={(event) => onValueChange(event.target.value)} />
        ) : (
          <input value={value} onChange={(event) => onValueChange(event.target.value)} />
        )}
      </Field>
      <TextStyleControls
        activeLocale={activeLocale}
        styleValue={localeContent.textStyles?.[fieldKey]}
        onChange={(patch) => onStyleChange(fieldKey, patch)}
        onCopy={() => onCopyStyle(fieldKey)}
        onReset={() => onResetStyle(fieldKey)}
      />
    </div>
  );
}

function GalleryPreviewMedia({ item }: { item: GalleryItem }) {
  const [mediaUrl, setMediaUrl] = useState(() =>
    isLocalMediaPath(item.path) ? "" : getPublicImageUrl(item.bucket, item.path),
  );

  useEffect(() => {
    let active = true;

    if (!item.path) {
      setMediaUrl("");
      return () => {
        active = false;
      };
    }

    if (!isLocalMediaPath(item.path)) {
      setMediaUrl(getPublicImageUrl(item.bucket, item.path));
      return () => {
        active = false;
      };
    }

    void resolveLocalMediaUrl(item.path).then((url) => {
      if (active) {
        setMediaUrl(url);
      }
    });

    return () => {
      active = false;
    };
  }, [item.bucket, item.path]);

  if (!mediaUrl) {
    return <div className="hero-image-preview-empty">No gallery media selected</div>;
  }

  return item.type === "video" ? (
    <video controls playsInline preload="metadata" src={mediaUrl} />
  ) : (
    <img src={mediaUrl} alt={item.alt} />
  );
}

function ChromeFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: ChromeContent;
  setContent: (content: ChromeContent) => void;
}) {
  const {
    copyStyle,
    localeContent: chrome,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<ChromeContent["tr"]>({ activeLocale, content, setContent });

  const updateNavItem = (index: number, field: keyof ChromeNavItem, value: string) => {
    const navItems = [...chrome.navItems];
    navItems[index] = {
      ...navItems[index],
      [field]: value,
    };

    setContent({
      ...content,
      [activeLocale]: {
        ...chrome,
        navItems,
      },
    });
  };

  const addNavItem = () => {
    const blankItem =
      activeLocale === "tr"
        ? {
            label: "Yeni bağlantı",
            href: "#contact",
          }
        : {
            label: "New link",
            href: "#contact",
          };

    setContent({
      ...content,
      [activeLocale]: {
        ...chrome,
        navItems: [...chrome.navItems, blankItem],
      },
    });
  };

  const removeNavItem = (index: number) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...chrome,
        navItems: chrome.navItems.filter((_item, itemIndex) => itemIndex !== index),
      },
    });
  };
  const footerPhonePreview = formatAdminPhonePreview(chrome.phoneHref);

  return (
    <>
      <p className="form-status is-warning" role="status">
        Header and footer positions are locked. This editor only changes labels and links.
      </p>
      <StylableField
        fieldKey="brandLabel"
        label="Brand label"
        localeContent={chrome}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={chrome.brandLabel}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("brandLabel", value)}
      />
      <StylableField
        fieldKey="ctaLabel"
        label="Header CTA label"
        localeContent={chrome}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={chrome.ctaLabel}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("ctaLabel", value)}
      />
      <Field label="Header CTA link">
        <input value={chrome.ctaHref} onChange={(event) => updateLocaleField("ctaHref", event.target.value)} />
      </Field>
      <div className="editor-group">
        <div className="editor-group-header">
          <h2>Navigation links</h2>
          <button className="secondary-button" type="button" onClick={addNavItem}>
            Add link
          </button>
        </div>
        {chrome.navItems.map((item, index) => (
          <div className="editor-nested" key={`${item.href}-${index}`}>
            <StylableField
              fieldKey={`navItems.${index}.label`}
              label="Label"
              localeContent={chrome}
              activeLocale={activeLocale}
              onCopyStyle={copyStyle}
              onResetStyle={resetStyle}
              value={item.label}
              onStyleChange={updateStyle}
              onValueChange={(value) => updateNavItem(index, "label", value)}
            />
            <Field label="Link">
              <input value={item.href} onChange={(event) => updateNavItem(index, "href", event.target.value)} />
            </Field>
            {chrome.navItems.length > 1 ? (
              <button className="secondary-button" type="button" onClick={() => removeNavItem(index)}>
                Remove link
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="editor-group">
        <h2>Footer</h2>
        <div className="footer-admin-preview" aria-label="Footer preview">
          <span style={getTextStyle(chrome, "footerText")}>{chrome.footerText}</span>
          {footerPhonePreview ? (
            <a href={footerPhonePreview.href} style={getTextStyle(chrome, "phoneLabel")}>
              {footerPhonePreview.label}
            </a>
          ) : null}
          <a href={chrome.footerLinkHref} style={getTextStyle(chrome, "footerLinkLabel")}>
            {chrome.footerLinkLabel}
          </a>
        </div>
        <StylableField
          fieldKey="footerText"
          label="Footer text"
          localeContent={chrome}
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          value={chrome.footerText}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("footerText", value)}
        />
        <StylableField
          fieldKey="footerLinkLabel"
          label="Footer link label"
          localeContent={chrome}
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          value={chrome.footerLinkLabel}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("footerLinkLabel", value)}
        />
        <Field label="Footer link">
          <input
            value={chrome.footerLinkHref}
            onChange={(event) => updateLocaleField("footerLinkHref", event.target.value)}
          />
        </Field>
      </div>
      <div className="editor-group">
        <h2>Direct contact buttons</h2>
        <p className="field-help">
          The phone link is also shown as the footer phone number.
        </p>
        <div className="editor-nested">
          <StylableField
            fieldKey="instagramLabel"
            label="Instagram label"
            localeContent={chrome}
            activeLocale={activeLocale}
            onCopyStyle={copyStyle}
            onResetStyle={resetStyle}
            value={chrome.instagramLabel}
            onStyleChange={updateStyle}
            onValueChange={(value) => updateLocaleField("instagramLabel", value)}
          />
          <Field label="Instagram link">
            <input
              placeholder="https://www.instagram.com/peragarden"
              value={chrome.instagramHref}
              onChange={(event) => updateLocaleField("instagramHref", event.target.value)}
            />
          </Field>
        </div>
        <div className="editor-nested">
          <StylableField
            fieldKey="phoneLabel"
            label="Footer phone label"
            localeContent={chrome}
            activeLocale={activeLocale}
            onCopyStyle={copyStyle}
            onResetStyle={resetStyle}
            value={chrome.phoneLabel}
            onStyleChange={updateStyle}
            onValueChange={(value) => updateLocaleField("phoneLabel", value)}
          />
          <Field label="Footer phone number link">
            <input
              placeholder="+90 555 111 22 33 or tel:+905551112233"
              value={chrome.phoneHref}
              onChange={(event) => updateLocaleField("phoneHref", event.target.value)}
            />
          </Field>
        </div>
        <div className="editor-nested">
          <StylableField
            fieldKey="whatsappLabel"
            label="WhatsApp label"
            localeContent={chrome}
            activeLocale={activeLocale}
            onCopyStyle={copyStyle}
            onResetStyle={resetStyle}
            value={chrome.whatsappLabel}
            onStyleChange={updateStyle}
            onValueChange={(value) => updateLocaleField("whatsappLabel", value)}
          />
          <Field label="WhatsApp link">
            <input
              placeholder="https://wa.me/905551112233"
              value={chrome.whatsappHref}
              onChange={(event) => updateLocaleField("whatsappHref", event.target.value)}
            />
          </Field>
        </div>
        <div className="editor-nested">
          <StylableField
            fieldKey="mapLabel"
            label="Google Maps label"
            localeContent={chrome}
            activeLocale={activeLocale}
            onCopyStyle={copyStyle}
            onResetStyle={resetStyle}
            value={chrome.mapLabel}
            onStyleChange={updateStyle}
            onValueChange={(value) => updateLocaleField("mapLabel", value)}
          />
          <Field label="Google Maps link">
            <input
              placeholder="https://maps.google.com/?q=Pera+Garden"
              value={chrome.mapHref}
              onChange={(event) => updateLocaleField("mapHref", event.target.value)}
            />
          </Field>
        </div>
      </div>
    </>
  );
}

function formatAdminPhonePreview(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withoutTel = trimmed.replace(/^tel:/i, "");
  const digits = withoutTel.replace(/\D/g, "");

  if (digits.length < 10) {
    return {
      href: trimmed.startsWith("tel:") ? trimmed : `tel:${trimmed}`,
      label: withoutTel.trim(),
    };
  }

  const normalizedHref = withoutTel.trim().startsWith("+") ? `tel:+${digits}` : `tel:${digits}`;

  if (digits.startsWith("90") && digits.length === 12) {
    return {
      href: normalizedHref,
      label: `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`,
    };
  }

  if (digits.length === 10) {
    return {
      href: normalizedHref,
      label: `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`,
    };
  }

  return {
    href: normalizedHref,
    label: withoutTel.trim(),
  };
}

function SectionLivePreview({
  content,
  locale,
  sectionKey,
}: {
  content: AnySectionContent;
  locale: Locale;
  sectionKey: SectionKey;
}) {
  const previewLabel = `${getSectionLabel(sectionKey, content)} preview`;
  const renderPreview = () => {
    if (sectionKey === "chrome") {
      const chrome = (content as ChromeContent)[locale] ?? (content as ChromeContent).tr;
      const footerPhonePreview = formatAdminPhonePreview(chrome.phoneHref);

      return (
        <div className="footer-admin-preview is-live-preview" aria-label="Footer preview">
          <span style={getTextStyle(chrome, "footerText")}>{chrome.footerText}</span>
          {footerPhonePreview ? (
            <a href={footerPhonePreview.href} style={getTextStyle(chrome, "phoneLabel")}>
              {footerPhonePreview.label}
            </a>
          ) : null}
          <a href={chrome.footerLinkHref} style={getTextStyle(chrome, "footerLinkLabel")}>
            {chrome.footerLinkLabel}
          </a>
        </div>
      );
    }

    if (sectionKey === "hero") {
      return <Hero content={content as HeroContent} locale={locale} />;
    }

    if (sectionKey === "about") {
      return <About content={content as AboutContent} locale={locale} />;
    }

    if (sectionKey === "services") {
      return <Services content={content as ServicesContent} locale={locale} />;
    }

    if (sectionKey === "gallery") {
      return <Gallery content={content as GalleryContent} locale={locale} />;
    }

    if (sectionKey === "slider") {
      return <Slider content={content as SliderContent} locale={locale} />;
    }

    if (sectionKey === "location") {
      return <Location content={content as LocationContent} locale={locale} />;
    }

    if (sectionKey === "faq") {
      return <Faq content={content as FaqContent} locale={locale} />;
    }

    if (sectionKey === "contact") {
      return <ContactForm content={content as ContactContent} locale={locale} previewMode />;
    }

    return <CustomSection content={content as CustomContent} locale={locale} />;
  };

  return (
    <section className="editor-group section-live-preview" aria-labelledby="section-live-preview-title">
      <div className="editor-group-header">
        <h2 id="section-live-preview-title">Live preview</h2>
        <span>{locale.toUpperCase()}</span>
      </div>
      <div
        className="section-live-preview-surface"
        aria-label={previewLabel}
        onClickCapture={(event) => event.preventDefault()}
        onSubmitCapture={(event) => event.preventDefault()}
      >
        {renderPreview()}
      </div>
    </section>
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
  const {
    copyStyle,
    localeContent: hero,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<HeroContent["tr"]>({ activeLocale, content, setContent });
  const heroImageUrl = getPublicImageUrl(hero.image.bucket, hero.image.path);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadStatusType, setUploadStatusType] = useState<"success" | "error">("success");

  const updateImagePath = (path: string) => {
    setContent({
      tr: {
        ...content.tr,
        image: {
          ...content.tr.image,
          bucket: "hero",
          path,
        },
      },
      en: {
        ...content.en,
        image: {
          ...content.en.image,
          bucket: "hero",
          path,
        },
      },
    });
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("");
    setUploadStatusType("success");

    try {
      const image = await uploadHeroImage(file, setUploadProgress);
      updateImagePath(image.path);
      setUploadProgress(100);
      setUploadStatus("Image uploaded. Save draft or publish to keep this path.");
    } catch (error) {
      setUploadStatusType("error");
      setUploadStatus(error instanceof Error ? error.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={hero}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={hero.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={hero}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={hero.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="subtitle"
        label="Subtitle"
        localeContent={hero}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={4}
        value={hero.subtitle}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("subtitle", value)}
      />
      <StylableField
        fieldKey="primaryCtaLabel"
        label="CTA label"
        localeContent={hero}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={hero.primaryCtaLabel}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("primaryCtaLabel", value)}
      />
      <Field label="CTA target">
        <input value={hero.primaryCtaHref} onChange={(event) => updateLocaleField("primaryCtaHref", event.target.value)} />
      </Field>
      <StylableField
        fieldKey="secondaryCtaLabel"
        label="Gallery CTA label"
        localeContent={hero}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={hero.secondaryCtaLabel}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("secondaryCtaLabel", value)}
      />
      <Field label="Gallery CTA target">
        <input value={hero.secondaryCtaHref} onChange={(event) => updateLocaleField("secondaryCtaHref", event.target.value)} />
      </Field>
      <div className="editor-group">
        <h2>Hero image</h2>
        <Field label="Upload image">
          <input
            accept="image/avif,image/jpeg,image/png,image/webp"
            disabled={uploading}
            type="file"
            onChange={(event) => {
              void handleUpload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </Field>
        <p className="field-help">
          Source max 30 MB. The app stores a high-quality WebP up to 8 MB in the hero bucket.
        </p>
        {uploading ? (
          <progress className="upload-progress" max={100} value={uploadProgress}>
            {uploadProgress}%
          </progress>
        ) : null}
        {uploadStatus ? (
          <p className={`form-status is-${uploadStatusType}`} role="status">
            {uploadStatus}
          </p>
        ) : null}
        <div className="hero-image-preview">
          {heroImageUrl ? (
            <img src={heroImageUrl} alt={hero.image.alt || "Hero image preview"} />
          ) : (
            <div className="hero-image-preview-empty">No Hero image selected</div>
          )}
        </div>
      </div>
      <Field label="Hero image path">
        <input
          value={hero.image.path}
          onChange={(event) => updateImagePath(event.target.value)}
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
  const {
    copyStyle,
    localeContent: about,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<AboutContent["tr"]>({ activeLocale, content, setContent });

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
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={about}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={about.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={about}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={about.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="body"
        label="Body"
        localeContent={about}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={5}
        value={about.body}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("body", value)}
      />
      <div className="editor-group">
        <h2>Highlights</h2>
        {about.highlights.map((highlight, index) => (
          <div className="editor-nested" key={`${highlight.title}-${index}`}>
            <StylableField
              fieldKey={`highlights.${index}.title`}
              label="Title"
              localeContent={about}
              activeLocale={activeLocale}
              onCopyStyle={copyStyle}
              onResetStyle={resetStyle}
              value={highlight.title}
              onStyleChange={updateStyle}
              onValueChange={(value) => updateHighlight(index, "title", value)}
            />
            <StylableField
              fieldKey={`highlights.${index}.description`}
              label="Description"
              localeContent={about}
              multiline
              activeLocale={activeLocale}
              onCopyStyle={copyStyle}
              onResetStyle={resetStyle}
              rows={3}
              value={highlight.description}
              onStyleChange={updateStyle}
              onValueChange={(value) => updateHighlight(index, "description", value)}
            />
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
  const {
    copyStyle,
    localeContent: slider,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<SliderContent["tr"]>({ activeLocale, content, setContent });

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
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={slider}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={slider.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={slider}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={slider.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="subtitle"
        label="Subtitle"
        localeContent={slider}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={4}
        value={slider.subtitle}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("subtitle", value)}
      />
      <div className="editor-group">
        <div className="editor-group-header">
          <h2>Slides</h2>
          <button className="secondary-button" type="button" onClick={addSlide}>
            Add slide
          </button>
        </div>
        {slider.slides.map((slide, index) => (
          <div className="editor-nested" key={`${slide.title}-${index}`}>
            <StylableField
              fieldKey={`slides.${index}.title`}
              label="Title"
              localeContent={slider}
              activeLocale={activeLocale}
              onCopyStyle={copyStyle}
              onResetStyle={resetStyle}
              value={slide.title}
              onStyleChange={updateStyle}
              onValueChange={(value) => updateSlide(index, "title", value)}
            />
            <StylableField
              fieldKey={`slides.${index}.description`}
              label="Description"
              localeContent={slider}
              multiline
              activeLocale={activeLocale}
              onCopyStyle={copyStyle}
              onResetStyle={resetStyle}
              rows={3}
              value={slide.description}
              onStyleChange={updateStyle}
              onValueChange={(value) => updateSlide(index, "description", value)}
            />
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
  const {
    copyStyle,
    localeContent: services,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<ServicesContent["tr"]>({ activeLocale, content, setContent });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadStatusType, setUploadStatusType] = useState<"success" | "error">("success");
  const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);
  const serviceCardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const serviceNameRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const isServiceInfoComplete = (item: ServicesItem) => Boolean(item.title.trim() && item.description.trim());

  useEffect(() => {
    if (newlyAddedIndex === null) {
      return;
    }

    const serviceCard = serviceCardRefs.current[newlyAddedIndex];
    const serviceNameInput = serviceNameRefs.current[newlyAddedIndex];

    serviceCard?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      serviceNameInput?.focus();
      serviceNameInput?.select();
    }, 200);
  }, [newlyAddedIndex, services.items.length]);

  const updateItem = (index: number, field: keyof Omit<ServicesItem, "image">, value: string) => {
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

  const updateItemImage = (index: number, image: Partial<ServicesItem["image"]>) => {
    const items = [...services.items];
    items[index] = {
      ...items[index],
      image: {
        ...items[index].image,
        ...image,
      },
    };

    setContent({
      ...content,
      [activeLocale]: {
        ...services,
        items,
      },
    });
  };

  const updateSharedItemVisibility = (index: number, isPublished: boolean) => {
    setContent({
      ...content,
      tr: {
        ...content.tr,
        items: content.tr.items.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                isPublished,
              }
            : item,
        ),
      },
      en: {
        ...content.en,
        items: content.en.items.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                isPublished,
              }
            : item,
        ),
      },
    });
  };

  const updateSharedImagePath = (index: number, path: string) => {
    setContent({
      ...content,
      tr: {
        ...content.tr,
        items: content.tr.items.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                image: {
                  ...item.image,
                  bucket: "hero",
                  path,
                },
              }
            : item,
        ),
      },
      en: {
        ...content.en,
        items: content.en.items.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                image: {
                  ...item.image,
                  bucket: "hero",
                  path,
                },
              }
            : item,
        ),
      },
    });
  };

  const reorderItems = (items: ServicesItem[], fromIndex: number, toIndex: number) => {
    const nextItems = [...items];
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);
    return nextItems;
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || toIndex >= services.items.length || fromIndex === toIndex) {
      return;
    }

    setContent({
      ...content,
      tr: {
        ...content.tr,
        items: reorderItems(content.tr.items, fromIndex, toIndex),
      },
      en: {
        ...content.en,
        items: reorderItems(content.en.items, fromIndex, toIndex),
      },
    });
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();

    if (draggedIndex === null || draggedIndex === targetIndex) {
      return;
    }

    moveItem(draggedIndex, targetIndex);
    setDraggedIndex(targetIndex);
  };

  const handleUpload = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    setUploadingIndex(index);
    setUploadProgress(0);
    setUploadStatus("");
    setUploadStatusType("success");

    try {
      const image = await uploadServiceImage(file, setUploadProgress);
      updateSharedImagePath(index, image.path);
      setUploadProgress(100);
      setUploadStatus("Service image uploaded. Save draft or publish to keep this image.");
    } catch (error) {
      setUploadStatusType("error");
      setUploadStatus(error instanceof Error ? error.message : "Could not upload service image.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const addItem = () => {
    const nextIndex = services.items.length;

    setContent({
      ...content,
      tr: {
        ...content.tr,
        items: [
          ...content.tr.items,
          {
            title: "",
            description: "",
            image: {
              bucket: "hero",
              path: "",
              alt: "Pera Garden hizmet görseli",
            },
            isPublished: false,
          },
        ],
      },
      en: {
        ...content.en,
        items: [
          ...content.en.items,
          {
            title: "",
            description: "",
            image: {
              bucket: "hero",
              path: "",
              alt: "Pera Garden service image",
            },
            isPublished: false,
          },
        ],
      },
    });
    setNewlyAddedIndex(nextIndex);
  };

  const removeItem = (index: number) => {
    if (!window.confirm(`Remove "${services.items[index].title}" from both languages?`)) {
      return;
    }

    setContent({
      ...content,
      tr: {
        ...content.tr,
        items: content.tr.items.filter((_item, itemIndex) => itemIndex !== index),
      },
      en: {
        ...content.en,
        items: content.en.items.filter((_item, itemIndex) => itemIndex !== index),
      },
    });
  };

  return (
    <>
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={services}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={services.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={services}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={services.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="subtitle"
        label="Subtitle"
        localeContent={services}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={4}
        value={services.subtitle}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("subtitle", value)}
      />
      <div className="editor-group">
        <div className="editor-group-header">
          <h2>Services</h2>
          <button className="secondary-button" type="button" onClick={addItem}>
            Add service
          </button>
        </div>
        {services.items.map((item, index) => {
          const isComplete = isServiceInfoComplete(item);
          return (
            <div
              className={`editor-nested service-editor-item${newlyAddedIndex === index ? " is-new" : ""}`}
              key={`${item.title}-${index}`}
              ref={(element) => {
                serviceCardRefs.current[index] = element;
              }}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(event) => handleDragOver(event, index)}
            >
            <div className="editor-group-header">
              <div className="editor-item-title">
                <button
                  aria-label={`Drag ${item.title}`}
                  className="drag-handle-button"
                  draggable
                  type="button"
                  onDragEnd={() => setDraggedIndex(null)}
                  onDragStart={() => setDraggedIndex(index)}
                >
                  Drag
                </button>
                <h3>Service {index + 1}</h3>
              </div>
              <div className="section-order-actions">
                <button
                  aria-label={`Move ${item.title} up`}
                  className="secondary-button compact-action"
                  disabled={index === 0}
                  type="button"
                  onClick={() => moveItem(index, index - 1)}
                >
                  Up
                </button>
                <button
                  aria-label={`Move ${item.title} down`}
                  className="secondary-button compact-action"
                  disabled={index === services.items.length - 1}
                  type="button"
                  onClick={() => moveItem(index, index + 1)}
                >
                  Down
                </button>
                <button
                  className="secondary-button compact-action"
                  disabled={!item.isPublished && !isComplete}
                  type="button"
                  onClick={() => updateSharedItemVisibility(index, !item.isPublished)}
                >
                  {item.isPublished ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <p className={`field-help service-visibility ${item.isPublished ? "is-visible" : "is-hidden"}`}>
              {item.isPublished
                ? "Visible on the homepage after publishing."
                : isComplete
                  ? "Kept in admin only. Hidden from the homepage after publishing."
                  : "Add a service name and service info before showing this on the homepage."}
            </p>
            <div className="service-info-editor">
              <div>
                <h4>Service information</h4>
                <p className="field-help">This title and description are the service info shown on the homepage.</p>
              </div>
              <div className="service-card-preview" aria-label={`Service ${index + 1} homepage preview`}>
                <div className="service-card-preview-media">
                  {item.image.path ? (
                    <img src={getPublicImageUrl(item.image.bucket, item.image.path)} alt={item.image.alt} />
                  ) : (
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <div className="service-card-preview-copy">
                  <small>{item.isPublished ? "Visible" : "Hidden"}</small>
                  <strong style={getTextStyle(services, `items.${index}.title`)}>{item.title || "Service name"}</strong>
                  <p style={getTextStyle(services, `items.${index}.description`)}>
                    {item.description || "Service info will appear here."}
                  </p>
                </div>
              </div>
              <Field label="Service name">
                <input
                  ref={(element) => {
                    serviceNameRefs.current[index] = element;
                  }}
                  value={item.title}
                  onChange={(event) => {
                    setNewlyAddedIndex(null);
                    updateItem(index, "title", event.target.value);
                  }}
                />
              </Field>
              <Field label="Service info">
                <textarea
                  rows={5}
                  value={item.description}
                  onChange={(event) => {
                    setNewlyAddedIndex(null);
                    updateItem(index, "description", event.target.value);
                  }}
                />
              </Field>
              <details className="text-style-disclosure">
                <summary className="text-style-summary">
                  <span className="text-style-summary-label">Service text style</span>
                  <span className="text-style-summary-value">
                    Name {describeStyle(services.textStyles?.[`items.${index}.title`])} · Info{" "}
                    {describeStyle(services.textStyles?.[`items.${index}.description`])}
                  </span>
                </summary>
                <div className="service-info-style-grid">
                  <div className="stylable-field">
                    <p className="field-help">Service name style</p>
                    <TextStyleControls
                      activeLocale={activeLocale}
                      styleValue={services.textStyles?.[`items.${index}.title`]}
                      onChange={(patch) => updateStyle(`items.${index}.title`, patch)}
                      onCopy={() => copyStyle(`items.${index}.title`)}
                      onReset={() => resetStyle(`items.${index}.title`)}
                    />
                  </div>
                  <div className="stylable-field">
                    <p className="field-help">Service info style</p>
                    <TextStyleControls
                      activeLocale={activeLocale}
                      styleValue={services.textStyles?.[`items.${index}.description`]}
                      onChange={(patch) => updateStyle(`items.${index}.description`, patch)}
                      onCopy={() => copyStyle(`items.${index}.description`)}
                      onReset={() => resetStyle(`items.${index}.description`)}
                    />
                  </div>
                </div>
              </details>
            </div>
            <div className="service-image-editor">
              <div className="service-admin-preview">
                {item.image.path ? (
                  <img src={getPublicImageUrl(item.image.bucket, item.image.path)} alt={item.image.alt} />
                ) : (
                  <div className="hero-image-preview-empty">No service image selected</div>
                )}
              </div>
              <div className="service-image-controls">
                <Field label="Upload service image">
                  <input
                    accept="image/avif,image/jpeg,image/png,image/webp"
                    disabled={uploadingIndex === index}
                    type="file"
                    onChange={(event) => {
                      void handleUpload(index, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </Field>
                <Field label="Image path">
                  <input value={item.image.path} onChange={(event) => updateSharedImagePath(index, event.target.value)} />
                </Field>
                <Field label="Image alt text">
                  <input
                    value={item.image.alt}
                    onChange={(event) => updateItemImage(index, { alt: event.target.value })}
                  />
                </Field>
              </div>
            </div>
            {uploadingIndex === index ? (
              <progress className="upload-progress" max={100} value={uploadProgress}>
                {uploadProgress}%
              </progress>
            ) : null}
            {services.items.length > 1 ? (
              <button className="secondary-button" type="button" onClick={() => removeItem(index)}>
                Remove service
              </button>
            ) : null}
            </div>
          );
        })}
        {uploadStatus ? (
          <p className={`form-status is-${uploadStatusType}`} role="status">
            {uploadStatus}
          </p>
        ) : null}
      </div>
    </>
  );
}

function GalleryFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: GalleryContent;
  setContent: (content: GalleryContent) => void;
}) {
  const {
    copyStyle,
    localeContent: gallery,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<GalleryContent["tr"]>({ activeLocale, content, setContent });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadStatusType, setUploadStatusType] = useState<"success" | "error">("success");

  const updateItem = (index: number, field: keyof Pick<GalleryItem, "title" | "caption" | "alt">, value: string) => {
    const items = [...gallery.items];
    items[index] = {
      ...items[index],
      [field]: value,
    };

    setContent({
      ...content,
      [activeLocale]: {
        ...gallery,
        items,
      },
    });
  };

  const updateSharedItem = (index: number, item: Partial<Pick<GalleryItem, "bucket" | "path" | "type" | "isPublished">>) => {
    const nextContent = {
      ...content,
      tr: {
        ...content.tr,
        items: content.tr.items.map((currentItem, itemIndex) =>
          itemIndex === index
            ? {
                ...currentItem,
                ...item,
              }
            : currentItem,
        ),
      },
      en: {
        ...content.en,
        items: content.en.items.map((currentItem, itemIndex) =>
          itemIndex === index
            ? {
                ...currentItem,
                ...item,
              }
            : currentItem,
        ),
      },
    };

    setContent(nextContent);
    return nextContent;
  };

  const persistGalleryPreview = async (nextContent: GalleryContent) => {
    if (!isLocalDev) {
      return;
    }

    await saveSectionDraft("gallery", nextContent);
    await publishSection("gallery", nextContent);
  };

  const updateSharedItemAndPersist = async (
    index: number,
    item: Partial<Pick<GalleryItem, "bucket" | "path" | "type" | "isPublished">>,
  ) => {
    const updateItems = (items: GalleryItem[]) =>
      items.map((currentItem, itemIndex) =>
        itemIndex === index
          ? {
              ...currentItem,
              ...item,
            }
          : currentItem,
      );

    const nextContent = {
      ...content,
      tr: {
        ...content.tr,
        items: updateItems(content.tr.items),
      },
      en: {
        ...content.en,
        items: updateItems(content.en.items),
      },
    };

    setContent(nextContent);
    await persistGalleryPreview(nextContent);
  };

  const reorderItems = (items: GalleryItem[], fromIndex: number, toIndex: number) => {
    const nextItems = [...items];
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);
    return nextItems;
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || toIndex >= gallery.items.length || fromIndex === toIndex) {
      return;
    }

    setContent({
      ...content,
      tr: {
        ...content.tr,
        items: reorderItems(content.tr.items, fromIndex, toIndex),
      },
      en: {
        ...content.en,
        items: reorderItems(content.en.items, fromIndex, toIndex),
      },
    });
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();

    if (draggedIndex === null || draggedIndex === targetIndex) {
      return;
    }

    moveItem(draggedIndex, targetIndex);
    setDraggedIndex(targetIndex);
  };

  const addItem = () => {
    const id = crypto.randomUUID();

    setContent({
      ...content,
      tr: {
        ...content.tr,
        items: [
          ...content.tr.items,
          {
            id,
            type: "photo",
            bucket: "gallery",
            path: "",
            title: "Yeni galeri öğesi",
            caption: "Bu fotoğraf veya video için kısa bir açıklama yazın.",
            alt: "Pera Garden galeri görseli",
            isPublished: false,
          },
        ],
      },
      en: {
        ...content.en,
        items: [
          ...content.en.items,
          {
            id,
            type: "photo",
            bucket: "gallery",
            path: "",
            title: "New gallery item",
            caption: "Write a short caption for this photo or video.",
            alt: "Pera Garden gallery media",
            isPublished: false,
          },
        ],
      },
    });
  };

  const handleUpload = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    setUploadingIndex(index);
    setUploadProgress(0);
    setUploadStatus("");
    setUploadStatusType("success");

    try {
      const media = await uploadGalleryMedia(file, setUploadProgress);
      const nextContent = updateSharedItem(index, {
        bucket: media.bucket,
        path: media.path,
        type: media.type,
        isPublished: true,
      });
      await persistGalleryPreview(nextContent);
      setUploadProgress(100);
      setUploadStatus(
        media.usedLocalFallback
          ? "The video is now attached locally for this dev session and shown on the website."
          : media.usedFallbackBucket
          ? "Gallery bucket was missing, so the media was uploaded to the hero bucket and shown on the website."
          : "Gallery media uploaded and shown on the website.",
      );
    } catch (error) {
      setUploadStatusType("error");
      setUploadStatus(error instanceof Error ? error.message : "Could not upload gallery media.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeItem = async (index: number) => {
    const item = gallery.items[index];

    if (!window.confirm(`Remove "${item.title}" from both languages and delete its media file?`)) {
      return;
    }

    setUploadingIndex(index);
    setUploadStatus("");
    setUploadStatusType("success");

    try {
      if (item.path) {
        await deleteGalleryMedia(item.bucket, item.path);
      }

      setContent({
        ...content,
        tr: {
          ...content.tr,
          items: content.tr.items.filter((_item, itemIndex) => itemIndex !== index),
        },
        en: {
          ...content.en,
          items: content.en.items.filter((_item, itemIndex) => itemIndex !== index),
        },
      });
      setUploadStatus("Gallery item removed. Save draft or publish to keep this change.");
    } catch (error) {
      setUploadStatusType("error");
      setUploadStatus(error instanceof Error ? error.message : "Could not remove gallery media.");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <>
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={gallery}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={gallery.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={gallery}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={gallery.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="subtitle"
        label="Subtitle"
        localeContent={gallery}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={4}
        value={gallery.subtitle}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("subtitle", value)}
      />
      <div className="editor-group">
        <div className="editor-group-header">
          <h2>Gallery media</h2>
          <button className="secondary-button" type="button" onClick={addItem}>
            Add media
          </button>
        </div>
        <p className="field-help">
          Upload photos up to 30 MB or WebM/MP4/MOV videos up to 1 GB. New media is visible after publishing
          only after you upload a file and choose Show.
        </p>
        {gallery.items.map((item, index) => {
          return (
            <div
              className="editor-nested service-editor-item"
              key={item.id || `${item.title}-${index}`}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(event) => handleDragOver(event, index)}
            >
              <div className="editor-group-header">
                <div className="editor-item-title">
                  <button
                    aria-label={`Drag ${item.title}`}
                    className="drag-handle-button"
                    draggable
                    type="button"
                    onDragEnd={() => setDraggedIndex(null)}
                    onDragStart={() => setDraggedIndex(index)}
                  >
                    Drag
                  </button>
                  <h3>Media {index + 1}</h3>
                </div>
                <div className="section-order-actions">
                  <button
                    aria-label={`Move ${item.title} up`}
                    className="secondary-button compact-action"
                    disabled={index === 0}
                    type="button"
                    onClick={() => moveItem(index, index - 1)}
                  >
                    Up
                  </button>
                  <button
                    aria-label={`Move ${item.title} down`}
                    className="secondary-button compact-action"
                    disabled={index === gallery.items.length - 1}
                    type="button"
                    onClick={() => moveItem(index, index + 1)}
                  >
                    Down
                  </button>
                  <button
                    className="secondary-button compact-action"
                    type="button"
                    onClick={() => {
                      void updateSharedItemAndPersist(index, { isPublished: !item.isPublished });
                    }}
                  >
                    {item.isPublished ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <p className={`field-help service-visibility ${item.isPublished ? "is-visible" : "is-hidden"}`}>
                {item.isPublished
                  ? "Visible in the gallery after publishing."
                  : "Kept in admin only. Hidden from the gallery after publishing."}
              </p>
              <div className="gallery-admin-editor">
                <div className="gallery-admin-preview">
                  <GalleryPreviewMedia item={item} />
                </div>
                <div className="service-image-controls">
                  <Field label="Upload photo or video">
                    <input
                      accept="image/avif,image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                      disabled={uploadingIndex === index}
                      type="file"
                      onChange={(event) => {
                        void handleUpload(index, event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </Field>
                  <Field label="Media type">
                    <select
                      value={item.type}
                      onChange={(event) => {
                        void updateSharedItemAndPersist(index, {
                          type: event.target.value === "video" ? "video" : "photo",
                        });
                      }}
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                  </Field>
                  <Field label="Storage path">
                    <input
                      value={item.path}
                      onChange={(event) => {
                        void updateSharedItemAndPersist(index, {
                          bucket: item.bucket,
                          path: event.target.value,
                        });
                      }}
                    />
                  </Field>
                </div>
              </div>
              <StylableField
                fieldKey={`items.${index}.title`}
                label="Title"
                localeContent={gallery}
                activeLocale={activeLocale}
                onCopyStyle={copyStyle}
                onResetStyle={resetStyle}
                value={item.title}
                onStyleChange={updateStyle}
                onValueChange={(value) => updateItem(index, "title", value)}
              />
              <StylableField
                fieldKey={`items.${index}.caption`}
                label="Caption"
                localeContent={gallery}
                multiline
                activeLocale={activeLocale}
                onCopyStyle={copyStyle}
                onResetStyle={resetStyle}
                rows={3}
                value={item.caption}
                onStyleChange={updateStyle}
                onValueChange={(value) => updateItem(index, "caption", value)}
              />
              <Field label="Alt text">
                <input value={item.alt} onChange={(event) => updateItem(index, "alt", event.target.value)} />
              </Field>
              {uploadingIndex === index ? (
                <progress className="upload-progress" max={100} value={uploadProgress}>
                  {uploadProgress}%
                </progress>
              ) : null}
              <button
                className="secondary-button"
                disabled={uploadingIndex === index}
                type="button"
                onClick={() => {
                  void removeItem(index);
                }}
              >
                Remove media
              </button>
            </div>
          );
        })}
        {uploadStatus ? (
          <p className={`form-status is-${uploadStatusType}`} role="status">
            {uploadStatus}
          </p>
        ) : null}
      </div>
    </>
  );
}

function LocationFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: LocationContent;
  setContent: (content: LocationContent) => void;
}) {
  const {
    copyStyle,
    localeContent: location,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<LocationContent["tr"]>({ activeLocale, content, setContent });

  return (
    <>
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={location}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={location.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={location}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={location.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="body"
        label="Body"
        localeContent={location}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={4}
        value={location.body}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("body", value)}
      />
      <StylableField
        fieldKey="addressLabel"
        label="Address label"
        localeContent={location}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={location.addressLabel}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("addressLabel", value)}
      />
      <StylableField
        fieldKey="address"
        label="Address"
        localeContent={location}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={3}
        value={location.address}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("address", value)}
      />
      <StylableField
        fieldKey="directionsLabel"
        label="Directions label"
        localeContent={location}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={location.directionsLabel}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("directionsLabel", value)}
      />
      <Field label="Directions link">
        <input
          value={location.directionsHref}
          onChange={(event) => updateLocaleField("directionsHref", event.target.value)}
        />
      </Field>
      <StylableField
        fieldKey="note"
        label="Note"
        localeContent={location}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={3}
        value={location.note}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("note", value)}
      />
    </>
  );
}

function FaqFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: FaqContent;
  setContent: (content: FaqContent) => void;
}) {
  const {
    copyStyle,
    localeContent: faq,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<FaqContent["tr"]>({ activeLocale, content, setContent });

  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    const items = [...faq.items];
    items[index] = {
      ...items[index],
      [field]: value,
    };

    setContent({
      ...content,
      [activeLocale]: {
        ...faq,
        items,
      },
    });
  };

  const addItem = () => {
    const blankItem =
      activeLocale === "tr"
        ? {
            question: "Yeni soru",
            answer: "Bu soru için kısa bir cevap yazın.",
          }
        : {
            question: "New question",
            answer: "Write a short answer for this question.",
          };

    setContent({
      ...content,
      [activeLocale]: {
        ...faq,
        items: [...faq.items, blankItem],
      },
    });
  };

  const removeItem = (index: number) => {
    setContent({
      ...content,
      [activeLocale]: {
        ...faq,
        items: faq.items.filter((_item, itemIndex) => itemIndex !== index),
      },
    });
  };

  return (
    <>
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={faq}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={faq.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={faq}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={faq.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="subtitle"
        label="Subtitle"
        localeContent={faq}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={4}
        value={faq.subtitle}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("subtitle", value)}
      />
      <div className="editor-group">
        <div className="editor-group-header">
          <h2>Questions</h2>
          <button className="secondary-button" type="button" onClick={addItem}>
            Add question
          </button>
        </div>
        {faq.items.map((item, index) => (
          <div className="editor-nested" key={`${item.question}-${index}`}>
            <StylableField
              fieldKey={`items.${index}.question`}
              label="Question"
              localeContent={faq}
              activeLocale={activeLocale}
              onCopyStyle={copyStyle}
              onResetStyle={resetStyle}
              value={item.question}
              onStyleChange={updateStyle}
              onValueChange={(value) => updateItem(index, "question", value)}
            />
            <StylableField
              fieldKey={`items.${index}.answer`}
              label="Answer"
              localeContent={faq}
              multiline
              activeLocale={activeLocale}
              onCopyStyle={copyStyle}
              onResetStyle={resetStyle}
              rows={3}
              value={item.answer}
              onStyleChange={updateStyle}
              onValueChange={(value) => updateItem(index, "answer", value)}
            />
            {faq.items.length > 1 ? (
              <button className="secondary-button" type="button" onClick={() => removeItem(index)}>
                Remove question
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

function ContactFields({
  activeLocale,
  content,
  chromeContent,
  setChromeContent,
  setContent,
}: {
  activeLocale: Locale;
  content: ContactContent;
  chromeContent: ChromeContent;
  setChromeContent: (content: ChromeContent) => void;
  setContent: (content: ContactContent) => void;
}) {
  const {
    copyStyle,
    localeContent: contact,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<ContactContent["tr"]>({ activeLocale, content, setContent });
  const {
    localeContent: chrome,
    updateLocaleField: updateChromeField,
  } = createLocaleEditor<ChromeContent["tr"]>({ activeLocale, content: chromeContent, setContent: setChromeContent });

  return (
    <>
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={contact}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={contact.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={contact}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={contact.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="description"
        label="Description"
        localeContent={contact}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={4}
        value={contact.description}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("description", value)}
      />
      <div className="editor-group">
        <h2>Form labels</h2>
        <StylableField
          fieldKey="firstNameLabel"
          label="First name label"
          localeContent={contact}
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          value={contact.firstNameLabel}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("firstNameLabel", value)}
        />
        <StylableField
          fieldKey="lastNameLabel"
          label="Last name label"
          localeContent={contact}
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          value={contact.lastNameLabel}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("lastNameLabel", value)}
        />
        <StylableField
          fieldKey="phoneLabel"
          label="Phone label"
          localeContent={contact}
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          value={contact.phoneLabel}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("phoneLabel", value)}
        />
        <StylableField
          fieldKey="phoneHelp"
          label="Phone helper text"
          localeContent={contact}
          multiline
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          rows={2}
          value={contact.phoneHelp}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("phoneHelp", value)}
        />
        <StylableField
          fieldKey="messageLabel"
          label="Message label"
          localeContent={contact}
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          value={contact.messageLabel}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("messageLabel", value)}
        />
        <StylableField
          fieldKey="submitLabel"
          label="Submit button label"
          localeContent={contact}
          activeLocale={activeLocale}
          onCopyStyle={copyStyle}
          onResetStyle={resetStyle}
          value={contact.submitLabel}
          onStyleChange={updateStyle}
          onValueChange={(value) => updateLocaleField("submitLabel", value)}
        />
      </div>
      <div className="editor-group">
        <h2>Direct contact links</h2>
        <p className="field-help">
          The phone link is also shown as the footer phone number.
        </p>
        <div className="editor-nested">
          <Field label="Instagram link">
            <input
              placeholder="https://www.instagram.com/peragarden"
              value={chrome.instagramHref}
              onChange={(event) => updateChromeField("instagramHref", event.target.value)}
            />
          </Field>
        </div>
        <div className="editor-nested">
          <Field label="Footer phone number link">
            <input
              placeholder="+90 555 111 22 33 or tel:+905551112233"
              value={chrome.phoneHref}
              onChange={(event) => updateChromeField("phoneHref", event.target.value)}
            />
          </Field>
        </div>
        <div className="editor-nested">
          <Field label="WhatsApp link">
            <input
              placeholder="https://wa.me/905551112233"
              value={chrome.whatsappHref}
              onChange={(event) => updateChromeField("whatsappHref", event.target.value)}
            />
          </Field>
        </div>
        <div className="editor-nested">
          <Field label="Google Maps link">
            <input
              placeholder="https://maps.google.com/?q=Pera+Garden"
              value={chrome.mapHref}
              onChange={(event) => updateChromeField("mapHref", event.target.value)}
            />
          </Field>
        </div>
      </div>
    </>
  );
}

function CustomFields({
  activeLocale,
  content,
  setContent,
}: {
  activeLocale: Locale;
  content: CustomContent;
  setContent: (content: CustomContent) => void;
}) {
  const {
    copyStyle,
    localeContent: custom,
    resetStyle,
    updateLocaleField,
    updateStyle,
  } = createLocaleEditor<CustomContent["tr"]>({ activeLocale, content, setContent });

  return (
    <>
      <StylableField
        fieldKey="eyebrow"
        label="Eyebrow"
        localeContent={custom}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={custom.eyebrow}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("eyebrow", value)}
      />
      <StylableField
        fieldKey="title"
        label="Title"
        localeContent={custom}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={custom.title}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("title", value)}
      />
      <StylableField
        fieldKey="body"
        label="Body"
        localeContent={custom}
        multiline
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        rows={7}
        value={custom.body}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("body", value)}
      />
      <StylableField
        fieldKey="primaryCtaLabel"
        label="CTA label"
        localeContent={custom}
        activeLocale={activeLocale}
        onCopyStyle={copyStyle}
        onResetStyle={resetStyle}
        value={custom.primaryCtaLabel}
        onStyleChange={updateStyle}
        onValueChange={(value) => updateLocaleField("primaryCtaLabel", value)}
      />
      <Field label="CTA target">
        <input
          value={custom.primaryCtaHref}
          onChange={(event) => updateLocaleField("primaryCtaHref", event.target.value)}
        />
      </Field>
    </>
  );
}

export function AdminSectionEditorPage({ sectionKey }: AdminSectionEditorPageProps) {
  const [content, setContent] = useState<AnySectionContent>(
    isBuiltInSectionKey(sectionKey) ? fallbackBySection[sectionKey] : fallbackCustomContent,
  );
  const [contactChromeContent, setContactChromeContent] = useState<ChromeContent>(fallbackChromeContent);
  const [activeLocale, setActiveLocale] = useState<Locale>("tr");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    Promise.all([
      getAdminSectionRow(sectionKey),
      sectionKey === "contact" ? getAdminSectionRow("chrome") : Promise.resolve(null),
    ])
      .then(([row, chromeRow]) => {
        if (active) {
          setContent(row.content);
          if (chromeRow) {
            setContactChromeContent(chromeRow.content as ChromeContent);
          }
          setHasUnsavedChanges(false);
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

  const updateContent = (nextContent: AnySectionContent) => {
    setContent(nextContent);
    setHasUnsavedChanges(true);

    if (statusType === "success") {
      setStatus("");
    }
  };

  const updateContactChromeContent = (nextContent: ChromeContent) => {
    setContactChromeContent(nextContent);
    setHasUnsavedChanges(true);

    if (statusType === "success") {
      setStatus("");
    }
  };

  const translateToEnglish = async () => {
    setTranslating(true);
    setStatus("");
    setStatusType("success");

    try {
      const translatedContent = await translateTurkishContentToEnglish(sectionKey, content);
      setContent(translatedContent);

      if (sectionKey === "contact") {
        const translatedChromeContent = await translateTurkishContentToEnglish("chrome", contactChromeContent);
        setContactChromeContent(translatedChromeContent as ChromeContent);
      }

      setActiveLocale("en");
      setHasUnsavedChanges(true);
      setStatus(
        sectionKey === "contact"
          ? "English content generated with free browser translation, including direct contact labels. Review it, then save or publish."
          : "English content generated with free browser translation. Review it, then save or publish.",
      );
    } catch (error) {
      setStatusType("error");
      setStatus(error instanceof Error ? error.message : "Could not translate content.");
    } finally {
      setTranslating(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    setStatus("");
    setStatusType("success");

    try {
      await saveSectionDraft(sectionKey, content);
      if (sectionKey === "contact") {
        await saveSectionDraft("chrome", contactChromeContent);
      }
      setHasUnsavedChanges(false);
      setStatus(
        sectionKey === "contact"
          ? "Contact draft saved, including direct contact links."
          : `${getSectionLabel(sectionKey, content)} draft saved.`,
      );
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
      if (sectionKey === "contact") {
        await saveSectionDraft("chrome", contactChromeContent);
      }
      await publishSection(sectionKey, content);
      if (sectionKey === "contact") {
        await publishSection("chrome", contactChromeContent);
      }
      setHasUnsavedChanges(false);
      setStatus(
        sectionKey === "contact"
          ? "Contact section and direct contact links published to the homepage."
          : `${getSectionLabel(sectionKey, content)} published to the homepage.`,
      );
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
          <h1>{getSectionLabel(sectionKey, content)}</h1>
        </div>
        <div className="admin-actions">
          <a className="secondary-button" href="/admin/sections">
            All sections
          </a>
          <button className="secondary-button" disabled={saving || translating} type="button" onClick={translateToEnglish}>
            {translating ? "Translating..." : "Auto translate TR to EN"}
          </button>
          <button className="secondary-button" disabled={saving || translating || !hasUnsavedChanges} type="button" onClick={saveDraft}>
            {saving ? "Saving..." : "Save draft"}
          </button>
          <button className="primary-action compact-action" disabled={saving || translating} type="button" onClick={publish}>
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </header>

      {hasUnsavedChanges ? (
        <p className="form-status is-warning editor-autosave-status" role="status">
          Unsaved changes. Use Save draft or Publish when you are ready.
        </p>
      ) : (
        <div className="editor-autosave-status" aria-hidden="true" />
      )}

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

      <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
        {sectionKey === "chrome" ? (
          <ChromeFields
            activeLocale={activeLocale}
            content={content as ChromeContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "hero" ? (
          <HeroFields
            activeLocale={activeLocale}
            content={content as HeroContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "about" ? (
          <AboutFields
            activeLocale={activeLocale}
            content={content as AboutContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "slider" ? (
          <SliderFields
            activeLocale={activeLocale}
            content={content as SliderContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "services" ? (
          <ServicesFields
            activeLocale={activeLocale}
            content={content as ServicesContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "gallery" ? (
          <GalleryFields
            activeLocale={activeLocale}
            content={content as GalleryContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "location" ? (
          <LocationFields
            activeLocale={activeLocale}
            content={content as LocationContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "faq" ? (
          <FaqFields
            activeLocale={activeLocale}
            content={content as FaqContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {sectionKey === "contact" ? (
          <ContactFields
            activeLocale={activeLocale}
            chromeContent={contactChromeContent}
            content={content as ContactContent}
            setChromeContent={updateContactChromeContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
        {!isBuiltInSectionKey(sectionKey) ? (
          <CustomFields
            activeLocale={activeLocale}
            content={content as CustomContent}
            setContent={(nextContent) => updateContent(nextContent)}
          />
        ) : null}
      </form>

      <SectionLivePreview content={content} locale={activeLocale} sectionKey={sectionKey} />

      {status ? (
        <p className={`form-status is-${statusType}`} role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
