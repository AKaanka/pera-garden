import { FormEvent, useCallback, useState } from "react";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { submitContactForm } from "../services/contact";
import { isSupabaseConfigured } from "../services/supabase/client";
import type { ContactFormPayload, Locale } from "../types";

type ContactFormProps = {
  locale: Locale;
};

const copy = {
  tr: {
    configError: "Iletisim formu henuz hazir degil.",
    fallbackError: "Bir seyler ters gitti. Lutfen tekrar deneyin.",
    firstName: "Ad",
    lastName: "Soyad",
    phone: "Telefon",
    message: "Mesaj",
    submitting: "Gonderiliyor...",
    submit: "Rezervasyon istegi gonder",
  },
  en: {
    configError: "Contact form is not configured yet.",
    fallbackError: "Something went wrong. Please try again.",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    message: "Message",
    submitting: "Sending...",
    submit: "Send request",
  },
} satisfies Record<Locale, Record<string, string>>;

const initialPayload: ContactFormPayload = {
  firstName: "",
  lastName: "",
  phone: "",
  message: "",
  locale: "tr",
  turnstileToken: "",
  website: "",
};

export function ContactForm({ locale }: ContactFormProps) {
  const [payload, setPayload] = useState<ContactFormPayload>({
    ...initialPayload,
    locale,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
  const formCopy = copy[locale];

  const updateField = (field: keyof ContactFormPayload, value: string) => {
    setPayload((current) => ({
      ...current,
      [field]: value,
      locale,
    }));
  };

  const handleTurnstileToken = useCallback((token: string) => {
    setPayload((current) => ({
      ...current,
      turnstileToken: token,
    }));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setFieldErrors({});

    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage(formCopy.configError);
      return;
    }

    try {
      const response = await submitContactForm({
        ...payload,
        locale,
      });

      if (!response.ok) {
        setStatus("error");
        setMessage(response.message);

        if ("fields" in response) {
          setFieldErrors(response.fields);
        }

        return;
      }

      setStatus("success");
      setMessage(response.message);
      setPayload({
        ...initialPayload,
        locale,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : formCopy.fallbackError);
    }
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="section-shell contact-shell">
        <div>
          <p className="eyebrow">Rezervasyon</p>
          <h2 id="contact-title">Tarih ve detaylari konusalim</h2>
          <p>
            Bilgilerinizi birakin; Pera Garden ekibi WhatsApp uzerinden size geri donsun.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            aria-hidden="true"
            autoComplete="off"
            className="honeypot"
            name="website"
            tabIndex={-1}
            value={payload.website}
            onChange={(event) => updateField("website", event.target.value)}
          />

          <label>
            {formCopy.firstName}
            <input
              autoComplete="given-name"
              value={payload.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
            {fieldErrors.firstName ? <span className="field-error">{fieldErrors.firstName}</span> : null}
          </label>

          <label>
            {formCopy.lastName}
            <input
              autoComplete="family-name"
              value={payload.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
            {fieldErrors.lastName ? <span className="field-error">{fieldErrors.lastName}</span> : null}
          </label>

          <label>
            {formCopy.phone}
            <input
              autoComplete="tel"
              inputMode="tel"
              value={payload.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
            {fieldErrors.phone ? <span className="field-error">{fieldErrors.phone}</span> : null}
          </label>

          <label>
            {formCopy.message}
            <textarea
              rows={5}
              value={payload.message}
              onChange={(event) => updateField("message", event.target.value)}
            />
            {fieldErrors.message ? <span className="field-error">{fieldErrors.message}</span> : null}
          </label>

          {turnstileSiteKey ? (
            <TurnstileWidget siteKey={turnstileSiteKey} onToken={handleTurnstileToken} />
          ) : null}

          {message ? (
            <p className={`form-status ${status === "error" ? "is-error" : "is-success"}`} role="status">
              {message}
            </p>
          ) : null}

          <button className="primary-action form-button" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? formCopy.submitting : formCopy.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
