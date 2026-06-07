import { useId } from "react";
import type { CustomContent, Locale } from "../types";
import { getTextStyle } from "../utils/textStyles";

type CustomSectionProps = {
  content: CustomContent;
  locale: Locale;
};

export function CustomSection({ content, locale }: CustomSectionProps) {
  const custom = content[locale] ?? content.tr;
  const titleId = useId();

  return (
    <section className="custom-section" aria-labelledby={titleId}>
      <div className="section-shell custom-section-shell">
        <div>
          <p className="eyebrow" style={getTextStyle(custom, "eyebrow")}>{custom.eyebrow}</p>
          <h2 id={titleId} style={getTextStyle(custom, "title")}>{custom.title}</h2>
          <p style={getTextStyle(custom, "body")}>{custom.body}</p>
        </div>

        {custom.primaryCtaLabel && custom.primaryCtaHref ? (
          <a className="primary-action compact-action" href={custom.primaryCtaHref} style={getTextStyle(custom, "primaryCtaLabel")}>
            {custom.primaryCtaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
