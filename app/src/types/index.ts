export type Locale = "tr" | "en";

export type SectionStatus = "draft" | "published";

export type BuiltInSectionKey =
  | "chrome"
  | "hero"
  | "about"
  | "services"
  | "gallery"
  | "slider"
  | "location"
  | "faq"
  | "contact";
export type CustomSectionKey = `custom_${string}`;
export type SectionKey = BuiltInSectionKey | CustomSectionKey;

export type HeroImage = {
  bucket: "hero";
  path: string;
  alt: string;
};

export type TextStyle = {
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?:
    | "inherit"
    | "serif"
    | "garamond"
    | "times"
    | "sans"
    | "modernSans"
    | "displaySerif"
    | "romanDisplay"
    | "script"
    | "handwritten"
    | "mono";
  color?: string;
};

export type TextStyleMap = Record<string, TextStyle>;

export type HeroLocaleContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  image: HeroImage;
  textStyles?: TextStyleMap;
};

// Optional per-section background preset (the warm palette tones). Applies to
// the whole section, so it lives at the top level of the content rather than
// inside a locale.
export type SectionBackground = "paper" | "beige" | "tan";

export type LocalizedContent<T> = Record<Locale, T> & {
  background?: SectionBackground;
};

export type HeroContent = LocalizedContent<HeroLocaleContent>;

export type ChromeNavItem = {
  label: string;
  href: string;
};

export type ChromeLogo = {
  bucket: "hero";
  path: string;
  alt: string;
};

export type ChromeLocaleContent = {
  brandLabel: string;
  logo: ChromeLogo;
  navItems: ChromeNavItem[];
  ctaLabel: string;
  ctaHref: string;
  instagramLabel: string;
  instagramHref: string;
  phoneLabel: string;
  phoneHref: string;
  whatsappLabel: string;
  whatsappHref: string;
  mapLabel: string;
  mapHref: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  textStyles?: TextStyleMap;
};

export type ChromeContent = LocalizedContent<ChromeLocaleContent>;

export type AboutHighlight = {
  title: string;
  description: string;
};

export type AboutLocaleContent = {
  eyebrow: string;
  title: string;
  body: string;
  experienceTitle: string;
  highlights: AboutHighlight[];
  textStyles?: TextStyleMap;
};

export type AboutContent = LocalizedContent<AboutLocaleContent>;

export type ServicesItem = {
  title: string;
  description: string;
  image: HeroImage;
  isPublished: boolean;
};

export type ServicesLocaleContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: ServicesItem[];
  textStyles?: TextStyleMap;
};

export type ServicesContent = LocalizedContent<ServicesLocaleContent>;

export type GalleryMediaType = "photo" | "video";

export type GalleryItem = {
  id: string;
  type: GalleryMediaType;
  bucket: "gallery" | "hero";
  path: string;
  title: string;
  caption: string;
  alt: string;
  isPublished: boolean;
};

export type GalleryLocaleContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: GalleryItem[];
  textStyles?: TextStyleMap;
};

export type GalleryContent = LocalizedContent<GalleryLocaleContent>;

export type SliderItem = {
  title: string;
  description: string;
};

export type SliderLocaleContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  slides: SliderItem[];
  textStyles?: TextStyleMap;
};

export type SliderContent = LocalizedContent<SliderLocaleContent>;

export type LocationLocaleContent = {
  eyebrow: string;
  title: string;
  body: string;
  addressLabel: string;
  address: string;
  directionsLabel: string;
  directionsHref: string;
  note: string;
  textStyles?: TextStyleMap;
};

export type LocationContent = LocalizedContent<LocationLocaleContent>;

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqLocaleContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
  textStyles?: TextStyleMap;
};

export type FaqContent = LocalizedContent<FaqLocaleContent>;

export type ContactLocaleContent = {
  eyebrow: string;
  title: string;
  description: string;
  firstNameLabel: string;
  lastNameLabel: string;
  phoneLabel: string;
  phoneHelp: string;
  messageLabel: string;
  submitLabel: string;
  textStyles?: TextStyleMap;
};

export type ContactContent = LocalizedContent<ContactLocaleContent>;

export type CustomLocaleContent = {
  eyebrow: string;
  title: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  textStyles?: TextStyleMap;
};

export type CustomContent = LocalizedContent<CustomLocaleContent>;

export type SectionContentMap = {
  chrome: ChromeContent;
  hero: HeroContent;
  about: AboutContent;
  services: ServicesContent;
  gallery: GalleryContent;
  slider: SliderContent;
  location: LocationContent;
  faq: FaqContent;
  contact: ContactContent;
};

export type AnySectionContent = SectionContentMap[BuiltInSectionKey] | CustomContent;

export type SiteContentRow<TContent = AnySectionContent> = {
  id: string;
  section_key: SectionKey;
  status: SectionStatus;
  order_index: number;
  is_visible: boolean;
  default_locale: Locale;
  content: TContent;
  published_at: string | null;
  updated_at: string;
};

export type ContactFormPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  message: string;
  locale: Locale;
  turnstileToken: string;
  website: string;
};

export type ContactFormResponse =
  | {
      ok: true;
      code: "SUBMITTED" | "WHATSAPP_QUEUED_RETRY";
      submissionId: string;
      whatsappStatus: "sent" | "failed";
      message: string;
    }
  | {
      ok: false;
      code: "VALIDATION_ERROR";
      message: string;
      fields: Partial<Record<keyof ContactFormPayload | "form", string>>;
    }
  | {
      ok: false;
      code: "TURNSTILE_FAILED" | "RATE_LIMITED" | "SERVER_ERROR" | "SERVER_CONFIG_ERROR";
      message: string;
      retryAfterSeconds?: number;
    };

export type Submission = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_normalized: string;
  message: string;
  locale: Locale;
  whatsapp_status: "pending" | "sent" | "failed";
  whatsapp_last_error: string | null;
  whatsapp_attempt_count: number;
  created_at: string;
};

export type RetryWhatsappResponse =
  | {
      ok: true;
      code: "WHATSAPP_RETRIED" | "WHATSAPP_RETRY_FAILED";
      submissionId: string;
      whatsappStatus: "sent" | "failed";
      message: string;
    }
  | {
      ok: false;
      code:
        | "METHOD_NOT_ALLOWED"
        | "SERVER_CONFIG_ERROR"
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "VALIDATION_ERROR"
        | "NOT_FOUND"
        | "SERVER_ERROR";
      message: string;
    };
