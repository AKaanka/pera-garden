import type { ReactNode } from "react";
import type { ContactContent, Locale } from "../types";
import { getSectionBackgroundStyle } from "../utils/sectionBackground";
import { getTextStyle } from "../utils/textStyles";

type ContactFormProps = {
  content?: ContactContent;
  contactActions?: ReactNode;
  locale: Locale;
  previewMode?: boolean;
  whatsappHref?: string;
};

const copy = {
  tr: {
    eyebrow: "İletişim",
    title: "Bizimle doğrudan iletişime geçin",
    description: "Tarih, kapasite ve davet detayları için size en uygun kanaldan hemen ulaşabilirsiniz.",
  },
  en: {
    eyebrow: "Contact",
    title: "Contact us directly",
    description: "Reach us through your preferred channel for dates, capacity, and celebration details.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function ContactForm({ contactActions, content, locale }: ContactFormProps) {
  const formCopy = copy[locale];
  const contact = content?.[locale] ?? content?.tr;
  const displayCopy = {
    eyebrow: contact?.eyebrow ?? formCopy.eyebrow,
    title: contact?.title ?? formCopy.title,
    description: contact?.description ?? formCopy.description,
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title" style={getSectionBackgroundStyle(content)}>
      <div className="section-shell contact-shell contact-shell-direct">
        <div className="contact-intro">
          <p className="eyebrow" style={getTextStyle(contact, "eyebrow")}>{displayCopy.eyebrow}</p>
          <h2 id="contact-title" style={getTextStyle(contact, "title")}>{displayCopy.title}</h2>
          <p style={getTextStyle(contact, "description")}>{displayCopy.description}</p>
        </div>

        {contactActions ? <div className="contact-direct-actions">{contactActions}</div> : null}
      </div>
    </section>
  );
}
