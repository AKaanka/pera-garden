export type Locale = "tr" | "en";

export type SectionStatus = "draft" | "published";

export type HeroImage = {
  bucket: "hero";
  path: string;
  alt: string;
};

export type HeroLocaleContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  image: HeroImage;
};

export type LocalizedContent<T> = Record<Locale, T>;

export type HeroContent = LocalizedContent<HeroLocaleContent>;

export type SiteContentRow<TContent> = {
  id: string;
  section_key: "hero";
  status: SectionStatus;
  order_index: number;
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
