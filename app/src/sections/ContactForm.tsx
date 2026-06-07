import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { submitContactForm } from "../services/contact";
import { isSupabaseConfigured } from "../services/supabase/client";
import type { ContactContent, ContactFormPayload, Locale } from "../types";
import { getTextStyle } from "../utils/textStyles";

type ContactFormProps = {
  content?: ContactContent;
  contactActions?: ReactNode;
  locale: Locale;
  previewMode?: boolean;
};

type ContactFieldErrors = Partial<Record<keyof ContactFormPayload | "form", string>>;

const copy = {
  tr: {
    eyebrow: "Rezervasyon",
    title: "Tarih ve detayları konuşalım",
    description: "Bilgilerinizi bırakın; Pera Garden ekibi WhatsApp üzerinden size geri dönsün.",
    configError: "İletişim formu henüz hazır değil.",
    fallbackError: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
    firstName: "Ad",
    lastName: "Soyad",
    phone: "Telefon",
    message: "Mesaj",
    firstNameRequired: "Lütfen adınızı yazın.",
    lastNameRequired: "Lütfen soyadınızı yazın.",
    phoneRequired: "Lütfen WhatsApp telefon numaranızı yazın.",
    messageRequired: "Lütfen etkinliğinizle ilgili kısa bir not yazın.",
    requiredSummary: "Lütfen işaretli alanları tamamlayın.",
    phoneHelp: "WhatsApp için ülke koduyla yazabilirsiniz: +90 ...",
    retryAfter: "Yaklaşık {minutes} dakika sonra tekrar deneyebilirsiniz.",
    disabledConfig: "Form yapılandırması tamamlanınca gönderim açılacak.",
    verificationPrompt: "Gönderimden önce doğrulamayı tamamlayın.",
    verificationReady: "Doğrulamayı tamamladıktan sonra isteğinizi gönderebilirsiniz.",
    verificationDone: "Doğrulama tamam. İsteğinizi şimdi gönderebilirsiniz.",
    verificationError: "Doğrulama yüklenemedi. Sayfayı yenileyip tekrar deneyin.",
    submitting: "Gönderiliyor...",
    submit: "Rezervasyon isteği gönder",
  },
  en: {
    eyebrow: "Reservations",
    title: "Let's talk through your date and details",
    description: "Leave your details and the Pera Garden team will reply on WhatsApp.",
    configError: "Contact form is not configured yet.",
    fallbackError: "Something went wrong. Please try again.",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    message: "Message",
    firstNameRequired: "Please enter your first name.",
    lastNameRequired: "Please enter your last name.",
    phoneRequired: "Please enter your WhatsApp phone number.",
    messageRequired: "Please add a short note about your event.",
    requiredSummary: "Please complete the highlighted fields.",
    phoneHelp: "Include a country code for WhatsApp if you can: +90 ...",
    retryAfter: "You can try again in about {minutes} minutes.",
    disabledConfig: "Sending will open after the form configuration is finished.",
    verificationPrompt: "Please complete the verification before sending.",
    verificationReady: "Once verification is complete, you can send your request.",
    verificationDone: "Verification complete. You can send your request now.",
    verificationError: "Verification could not load. Refresh the page and try again.",
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

export function ContactForm({ contactActions, content, locale, previewMode = false }: ContactFormProps) {
  const [payload, setPayload] = useState<ContactFormPayload>({
    ...initialPayload,
    locale,
  });
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [turnstileState, setTurnstileState] = useState<
    "idle" | "ready" | "solved" | "expired" | "error"
  >("idle");
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
  const formCopy = copy[locale];
  const contact = content?.[locale] ?? content?.tr;
  const displayCopy = {
    eyebrow: contact?.eyebrow ?? formCopy.eyebrow,
    title: contact?.title ?? formCopy.title,
    description: contact?.description ?? formCopy.description,
    firstName: contact?.firstNameLabel ?? formCopy.firstName,
    lastName: contact?.lastNameLabel ?? formCopy.lastName,
    phone: contact?.phoneLabel ?? formCopy.phone,
    phoneHelp: contact?.phoneHelp ?? formCopy.phoneHelp,
    message: contact?.messageLabel ?? formCopy.message,
    submit: contact?.submitLabel ?? formCopy.submit,
  };
  const isSubmitting = status === "submitting";
  const requiresTurnstile = Boolean(turnstileSiteKey) && !previewMode;
  const isTurnstileSatisfied = !requiresTurnstile || Boolean(payload.turnstileToken);
  const isDisabled = previewMode || isSubmitting || !isSupabaseConfigured || !isTurnstileSatisfied;

  const updateField = (field: keyof ContactFormPayload, value: string) => {
    setPayload((current) => ({
      ...current,
      [field]: value,
      locale,
    }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleTurnstileToken = useCallback((token: string) => {
    setPayload((current) => ({
      ...current,
      turnstileToken: token,
    }));
  }, []);

  const handleTurnstileState = useCallback(
    (nextState: "idle" | "ready" | "solved" | "expired" | "error") => {
      setTurnstileState(nextState);
    },
    [],
  );

  const resetTurnstile = () => {
    if (turnstileSiteKey) {
      setTurnstileResetSignal((current) => current + 1);
    }
  };

  const validateRequiredFields = () => {
    const nextErrors: ContactFieldErrors = {};

    if (!payload.firstName.trim()) {
      nextErrors.firstName = formCopy.firstNameRequired;
    }

    if (!payload.lastName.trim()) {
      nextErrors.lastName = formCopy.lastNameRequired;
    }

    if (!payload.phone.trim()) {
      nextErrors.phone = formCopy.phoneRequired;
    }

    if (!payload.message.trim()) {
      nextErrors.message = formCopy.messageRequired;
    }

    return nextErrors;
  };

  const formatResponseMessage = (response: Awaited<ReturnType<typeof submitContactForm>>) => {
    if (!response.ok && response.code === "RATE_LIMITED" && response.retryAfterSeconds) {
      const minutes = Math.max(1, Math.ceil(response.retryAfterSeconds / 60));

      return `${response.message} ${formCopy.retryAfter.replace("{minutes}", String(minutes))}`;
    }

    return response.message;
  };

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

    const requiredErrors = validateRequiredFields();

    if (Object.keys(requiredErrors).length > 0) {
      setStatus("error");
      setFieldErrors(requiredErrors);
      setMessage(formCopy.requiredSummary);
      return;
    }

    if (requiresTurnstile && !payload.turnstileToken) {
      setStatus("error");
      setMessage(
        turnstileState === "error" ? formCopy.verificationError : formCopy.verificationPrompt,
      );
      return;
    }

    try {
      const response = await submitContactForm({
        ...payload,
        locale,
      });

      if (!response.ok) {
        setStatus("error");
        setMessage(formatResponseMessage(response));

        if ("fields" in response) {
          setFieldErrors(response.fields);
        }

        resetTurnstile();
        return;
      }

      setStatus("success");
      setMessage(response.message);
      setPayload({
        ...initialPayload,
        locale,
      });
      resetTurnstile();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : formCopy.fallbackError);
      resetTurnstile();
    }
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="section-shell contact-shell">
        <div className="contact-intro">
          {contactActions ? <div className="contact-actions-mobile">{contactActions}</div> : null}
          <p className="eyebrow" style={getTextStyle(contact, "eyebrow")}>{displayCopy.eyebrow}</p>
          <h2 id="contact-title" style={getTextStyle(contact, "title")}>{displayCopy.title}</h2>
          <p style={getTextStyle(contact, "description")}>{displayCopy.description}</p>
          {contactActions ? <div className="contact-actions-desktop">{contactActions}</div> : null}
        </div>

        <form className="contact-form" noValidate onSubmit={handleSubmit}>
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
            <span style={getTextStyle(contact, "firstNameLabel")}>{displayCopy.firstName}</span>
            <input
              aria-describedby={fieldErrors.firstName ? "contact-first-name-error" : undefined}
              aria-invalid={Boolean(fieldErrors.firstName)}
              autoComplete="given-name"
              id="contact-first-name"
              name="firstName"
              value={payload.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
            {fieldErrors.firstName ? (
              <span className="field-error" id="contact-first-name-error">
                {fieldErrors.firstName}
              </span>
            ) : null}
          </label>

          <label>
            <span style={getTextStyle(contact, "lastNameLabel")}>{displayCopy.lastName}</span>
            <input
              aria-describedby={fieldErrors.lastName ? "contact-last-name-error" : undefined}
              aria-invalid={Boolean(fieldErrors.lastName)}
              autoComplete="family-name"
              id="contact-last-name"
              name="lastName"
              value={payload.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
            {fieldErrors.lastName ? (
              <span className="field-error" id="contact-last-name-error">
                {fieldErrors.lastName}
              </span>
            ) : null}
          </label>

          <label>
            <span style={getTextStyle(contact, "phoneLabel")}>{displayCopy.phone}</span>
            <input
              aria-describedby={`contact-phone-help${fieldErrors.phone ? " contact-phone-error" : ""}`}
              aria-invalid={Boolean(fieldErrors.phone)}
              autoComplete="tel"
              id="contact-phone"
              inputMode="tel"
              name="phone"
              value={payload.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
            <span className="field-help" id="contact-phone-help" style={getTextStyle(contact, "phoneHelp")}>
              {displayCopy.phoneHelp}
            </span>
            {fieldErrors.phone ? (
              <span className="field-error" id="contact-phone-error">
                {fieldErrors.phone}
              </span>
            ) : null}
          </label>

          <label>
            <span style={getTextStyle(contact, "messageLabel")}>{displayCopy.message}</span>
            <textarea
              aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
              aria-invalid={Boolean(fieldErrors.message)}
              id="contact-message"
              name="message"
              rows={5}
              value={payload.message}
              onChange={(event) => updateField("message", event.target.value)}
            />
            {fieldErrors.message ? (
              <span className="field-error" id="contact-message-error">
                {fieldErrors.message}
              </span>
            ) : null}
          </label>

          {turnstileSiteKey && !previewMode ? (
            <>
              <TurnstileWidget
                resetSignal={turnstileResetSignal}
                siteKey={turnstileSiteKey}
                onStatusChange={handleTurnstileState}
                onToken={handleTurnstileToken}
              />
              <p
                className={`field-help contact-verification-help${
                  turnstileState === "error" ? " is-error" : ""
                }`}
                id="contact-turnstile-help"
              >
                {turnstileState === "error"
                  ? formCopy.verificationError
                  : turnstileState === "solved"
                    ? formCopy.verificationDone
                    : formCopy.verificationReady}
              </p>
            </>
          ) : null}

          {message || fieldErrors.form || (!isSupabaseConfigured && !previewMode) ? (
            <p
              className={`form-status ${status === "error" || !isSupabaseConfigured ? "is-error" : "is-success"}`}
              id="contact-form-status"
              role="status"
            >
              {fieldErrors.form ?? (message || formCopy.disabledConfig)}
            </p>
          ) : null}

          <button
            aria-describedby={
              !isSupabaseConfigured
                ? "contact-form-status"
                : requiresTurnstile
                  ? "contact-turnstile-help"
                  : undefined
            }
            className="primary-action form-button"
            disabled={isDisabled}
            type="submit"
          >
            {status === "submitting" ? formCopy.submitting : displayCopy.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
