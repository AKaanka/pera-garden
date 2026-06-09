import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { About } from "../sections/About";
import { ContactForm } from "../sections/ContactForm";
import { CustomSection } from "../sections/CustomSection";
import { Faq } from "../sections/Faq";
import { Gallery } from "../sections/Gallery";
import { Hero } from "../sections/Hero";
import { Location } from "../sections/Location";
import { Services } from "../sections/Services";
import { Slider } from "../sections/Slider";
import {
  fallbackChromeContent,
  fallbackGalleryContent,
  getPublishedChrome,
  getPublishedSections,
} from "../services/supabase/content";
import type {
  AboutContent,
  ChromeContent,
  ChromeLocaleContent,
  ContactContent,
  CustomContent,
  FaqContent,
  GalleryContent,
  HeroContent,
  LocationContent,
  Locale,
  ServicesContent,
  SiteContentRow,
  SliderContent,
} from "../types";
import { getTextStyle } from "../utils/textStyles";

type HomeState = {
  loading: boolean;
  chrome: ChromeContent | null;
  sections: SiteContentRow[];
  error: string;
};

function PageState({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <section className="page-state" aria-labelledby="page-state-title">
      <div className="page-state-panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="page-state-title">{title}</h1>
        <p>{message}</p>
        <a className="primary-action" href="#contact">
          İletişime geç
        </a>
      </div>
    </section>
  );
}

function renderSection(
  row: SiteContentRow,
  locale: Locale,
  contactActions?: ReactNode,
  mapHref?: string,
  whatsappHref?: string,
) {
  if (row.section_key === "about") {
    return <About content={row.content as AboutContent} key={row.id} locale={locale} />;
  }

  if (row.section_key === "slider") {
    return <Slider content={row.content as SliderContent} key={row.id} locale={locale} />;
  }

  if (row.section_key === "services") {
    return <Services content={row.content as ServicesContent} key={row.id} locale={locale} />;
  }

  if (row.section_key === "gallery") {
    return <Gallery content={row.content as GalleryContent} key={row.id} locale={locale} />;
  }

  if (row.section_key === "location") {
    return <Location content={row.content as LocationContent} key={row.id} locale={locale} mapHref={mapHref} />;
  }

  if (row.section_key === "faq") {
    return <Faq content={row.content as FaqContent} key={row.id} locale={locale} />;
  }

  if (row.section_key === "contact") {
    return (
      <ContactForm
        contactActions={contactActions}
        content={row.content as ContactContent}
        key={row.id}
        locale={locale}
        whatsappHref={whatsappHref}
      />
    );
  }

  if (row.section_key.startsWith("custom_")) {
    return <CustomSection content={row.content as CustomContent} key={row.id} locale={locale} />;
  }

  return <Hero content={row.content as HeroContent} key={row.id} locale={locale} />;
}

type ContactAction = {
  fieldKey: keyof Pick<
    ChromeLocaleContent,
    "instagramLabel" | "phoneLabel" | "whatsappLabel" | "mapLabel"
  >;
  href: string;
  icon: "instagram" | "phone" | "whatsapp" | "map";
  label: string;
  value?: string;
};

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 10) {
    return value.trim();
  }

  if (digits.startsWith("90") && digits.length === 12) {
    return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }

  return value.trim();
}

function normalizePhoneHref(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^tel:/i.test(trimmed)) {
    return trimmed;
  }

  const phoneLike = trimmed.match(/\+?\d[\d\s()-]{8,}/)?.[0];

  if (!phoneLike) {
    return trimmed;
  }

  const normalizedNumber = phoneLike.trim().startsWith("+")
    ? `+${phoneLike.replace(/\D/g, "")}`
    : phoneLike.replace(/\D/g, "");

  return `tel:${normalizedNumber}`;
}

function getContactActionValue(action: ContactAction) {
  if (action.fieldKey === "phoneLabel") {
    const phoneHref = normalizePhoneHref(action.href);
    return formatPhoneNumber(phoneHref.replace(/^tel:/i, ""));
  }

  if (action.fieldKey === "whatsappLabel") {
    try {
      const url = new URL(action.href);
      const phoneFromQuery = url.searchParams.get("phone");
      const phoneFromPath = /(^|\.)wa\.me$/i.test(url.hostname) ? url.pathname.replace(/\//g, "") : "";
      const phoneFromText = !phoneFromQuery && !phoneFromPath ? action.href.match(/\+?\d[\d\s()-]{8,}/)?.[0] : "";
      const phone = phoneFromQuery || phoneFromPath;

      return phone ? formatPhoneNumber(phone) : phoneFromText ? formatPhoneNumber(phoneFromText) : undefined;
    } catch {
      const phoneFromText = action.href.match(/\+?\d[\d\s()-]{8,}/)?.[0];
      return phoneFromText ? formatPhoneNumber(phoneFromText) : undefined;
    }
  }

  return undefined;
}

function getContactActions(content: ChromeLocaleContent): ContactAction[] {
  const actions: ContactAction[] = [
    {
      fieldKey: "instagramLabel",
      href: content.instagramHref,
      icon: "instagram",
      label: content.instagramLabel,
    },
    {
      fieldKey: "phoneLabel",
      href: normalizePhoneHref(content.phoneHref),
      icon: "phone",
      label: content.phoneLabel,
    },
    {
      fieldKey: "whatsappLabel",
      href: content.whatsappHref,
      icon: "whatsapp",
      label: content.whatsappLabel,
    },
    {
      fieldKey: "mapLabel",
      href: content.mapHref,
      icon: "map",
      label: content.mapLabel,
    },
  ];

  return actions
    .filter((action) => action.href.trim() && action.label.trim())
    .map((action) => ({
      ...action,
      value: getContactActionValue(action),
    }));
}

function ContactActionIcon({ icon }: { icon: ContactAction["icon"] }) {
  if (icon === "instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.9" r="1.1" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "phone") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M8.1 5.3c.4-.9 1.6-1.3 2.5-.8l1.7.9c.8.4 1.2 1.4.9 2.2l-.7 1.9a1.6 1.6 0 0 0 .4 1.7l.1.1c1 1 2.1 1.8 3.3 2.4l.5.2c.6.3 1.4.1 1.8-.5l1.2-1.5c.6-.7 1.6-.9 2.4-.4l1.4.9c.8.5 1.1 1.5.7 2.3l-.5 1c-.6 1.2-1.9 1.9-3.2 1.7A16.8 16.8 0 0 1 5.6 8.3c-.2-1.1 0-2.1.5-3Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (icon === "whatsapp") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M12 4.4a7.6 7.6 0 0 0-6.5 11.6l-.9 3.6 3.7-1a7.6 7.6 0 1 0 3.7-14.2Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M9.6 9.1c.2-.4.4-.4.7-.4h.6c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.7c-.1.1-.1.3 0 .5.4.7 1 1.3 1.7 1.7.1.1.3.1.4 0l.8-.4c.2-.1.4-.1.6 0l1.4.6c.2.1.3.2.3.5v.6c0 .3 0 .6-.4.7-.5.2-1 .3-1.4.2-1-.2-2.4-.9-3.8-2.3-1.5-1.5-2.2-2.9-2.4-3.9 0-.4.1-.9.2-1.3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 21s6.2-5.7 6.2-11.1A6.2 6.2 0 0 0 12 3.7Z"
        fill="#4285f4"
      />
      <path
        d="M12 21S5.8 15.3 5.8 9.9A6.2 6.2 0 0 1 12 3.7Z"
        fill="#34a853"
      />
      <path
        d="M12 3.7a6.2 6.2 0 0 1 5.2 9.6L12 21Z"
        fill="#fbbc04"
        opacity="0.96"
      />
      <path
        d="M12 3.7a6.2 6.2 0 0 0-5.2 9.6L12 21Z"
        fill="#ea4335"
        opacity="0.96"
      />
      <circle
        cx="12"
        cy="9.9"
        r="2.35"
        fill="#fff"
      />
      <circle
        cx="12"
        cy="9.9"
        r="1.08"
        fill="#4285f4"
      />
    </svg>
  );
}

function ContactActionButtons({
  className = "",
  content,
}: {
  className?: string;
  content: ChromeLocaleContent;
}) {
  const actions = getContactActions(content);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={`contact-action-row${className ? ` ${className}` : ""}`} aria-label="Direct contact links">
      {actions.map((action) => (
        <a
          className={`contact-action-link is-${action.fieldKey.replace("Label", "")}`}
          href={action.href}
          key={action.fieldKey}
          rel={isExternalHref(action.href) ? "noreferrer" : undefined}
          style={getTextStyle(content, action.fieldKey)}
          target={isExternalHref(action.href) ? "_blank" : undefined}
        >
          <span className="contact-action-icon" aria-hidden="true">
            <ContactActionIcon icon={action.icon} />
          </span>
          <span className="contact-action-copy">
            <span className="contact-action-label">{action.label}</span>
            {action.value ? <small>{action.value}</small> : null}
          </span>
        </a>
      ))}
    </div>
  );
}

function SiteHeader({
  chrome,
  locale,
  onLocaleChange,
}: {
  chrome: ChromeContent;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  const content = chrome[locale] ?? chrome.tr;
  const [isScrolled, setIsScrolled] = useState(window.scrollY > 24);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={isScrolled ? "site-header is-scrolled" : "site-header"}>
      <div className="site-header-branding">
        <a className="site-brand" href="#top" style={getTextStyle(content, "brandLabel")}>
          {content.brandLabel}
        </a>
      </div>
      <div className="site-language-toggle" aria-label="Language">
        <button
          aria-pressed={locale === "tr"}
          className={locale === "tr" ? "is-active" : ""}
          type="button"
          onClick={() => onLocaleChange("tr")}
        >
          TR
        </button>
        <button
          aria-pressed={locale === "en"}
          className={locale === "en" ? "is-active" : ""}
          type="button"
          onClick={() => onLocaleChange("en")}
        >
          EN
        </button>
      </div>
      <nav className="site-nav" aria-label="Main">
        {content.navItems.map((item, index) => (
          <a href={item.href} key={`${item.href}-${index}`} style={getTextStyle(content, `navItems.${index}.label`)}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function SiteFooter({ chrome, locale }: { chrome: ChromeContent; locale: Locale }) {
  const content = chrome[locale] ?? chrome.tr;
  const phoneAction = getContactActions(content).find((action) => action.fieldKey === "phoneLabel");

  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <span style={getTextStyle(content, "footerText")}>{content.footerText}</span>
      </div>
      {phoneAction ? (
        <div className="site-footer-contact">
          <span className="site-footer-location">Safranbolu</span>
          <a className="site-footer-phone" href={phoneAction.href} style={getTextStyle(content, "phoneLabel")}>
            {phoneAction.value ?? phoneAction.label}
          </a>
        </div>
      ) : null}
      <a className="site-footer-action" href={content.footerLinkHref} style={getTextStyle(content, "footerLinkLabel")}>
        {content.footerLinkLabel}
      </a>
    </footer>
  );
}

function withLocalGalleryPreview(sections: SiteContentRow[]) {
  if (!import.meta.env.DEV || sections.some((section) => section.section_key === "gallery")) {
    return sections;
  }

  const galleryRow: SiteContentRow<GalleryContent> = {
    id: "local-gallery-preview",
    section_key: "gallery",
    status: "published",
    order_index: 3,
    is_visible: true,
    default_locale: "tr",
    content: fallbackGalleryContent,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const nextSections = [...sections];
  const servicesIndex = nextSections.findIndex((section) => section.section_key === "services");
  nextSections.splice(servicesIndex >= 0 ? servicesIndex + 1 : Math.min(3, nextSections.length), 0, galleryRow);

  return nextSections;
}

export function HomePage() {
  const [locale, setLocale] = useState<Locale>("tr");
  const [state, setState] = useState<HomeState>({
    loading: true,
    chrome: null,
    sections: [],
    error: "",
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    let active = true;

    Promise.all([getPublishedChrome(), getPublishedSections()])
      .then(([chrome, sections]) => {
        if (active) {
          setState({
            loading: false,
            chrome: chrome.content,
            sections,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            chrome: null,
            sections: [],
            error: error instanceof Error ? error.message : "Could not load content.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return (
      <main className="page-state" aria-live="polite">
        <span>Loading Pera Garden...</span>
      </main>
    );
  }

  if (state.error) {
    return (
      <>
        <main>
          <PageState
            eyebrow="Pera Garden"
            title="Sayfa şu anda yüklenemiyor"
            message="Lütfen biraz sonra tekrar deneyin ya da davet detayları için doğrudan bizimle iletişime geçin."
          />
          <ContactForm locale={locale} whatsappHref={(fallbackChromeContent[locale] ?? fallbackChromeContent.tr).whatsappHref} />
        </main>
        <SiteFooter chrome={fallbackChromeContent} locale={locale} />
      </>
    );
  }

  if (state.sections.length === 0) {
    return (
      <>
        <main>
          <PageState
            eyebrow="Pera Garden"
            title="Yayınlanan içerik hazırlanıyor"
            message="Pera Garden sayfası kısa süre içinde tekrar yayında olacak. Tarih ve davet bilgisi için bizimle iletişime geçebilirsiniz."
          />
          <ContactForm locale={locale} whatsappHref={((state.chrome ?? fallbackChromeContent)[locale] ?? (state.chrome ?? fallbackChromeContent).tr).whatsappHref} />
        </main>
        <SiteFooter chrome={state.chrome ?? fallbackChromeContent} locale={locale} />
      </>
    );
  }

  const publicSections = withLocalGalleryPreview(state.sections);
  const chromeContent = state.chrome ? state.chrome[locale] ?? state.chrome.tr : undefined;
  const mapHref = chromeContent?.mapHref;
  const whatsappHref = chromeContent?.whatsappHref;
  const contactActions = chromeContent ? <ContactActionButtons content={chromeContent} /> : undefined;

  return (
    <>
      {state.chrome ? <SiteHeader chrome={state.chrome} locale={locale} onLocaleChange={setLocale} /> : null}
      <main id="top" className="site-main">
        {publicSections.map((section) => renderSection(section, locale, contactActions, mapHref, whatsappHref))}
        {publicSections.some((section) => section.section_key === "contact") ? null : (
          <ContactForm contactActions={contactActions} locale={locale} whatsappHref={whatsappHref} />
        )}
      </main>
      {state.chrome ? <SiteFooter chrome={state.chrome} locale={locale} /> : null}
    </>
  );
}
