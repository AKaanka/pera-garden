import type { FaqContent, Locale } from "../types";
import { getTextStyle } from "../utils/textStyles";

type FaqProps = {
  content: FaqContent;
  locale: Locale;
};

export function Faq({ content, locale }: FaqProps) {
  const faq = content[locale] ?? content.tr;

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="section-shell faq-shell">
        <div className="faq-heading">
          <p className="eyebrow" style={getTextStyle(faq, "eyebrow")}>{faq.eyebrow}</p>
          <h2 id="faq-title" style={getTextStyle(faq, "title")}>{faq.title}</h2>
          <p style={getTextStyle(faq, "subtitle")}>{faq.subtitle}</p>
        </div>

        <div className="faq-list">
          {faq.items.map((item, index) => (
            <details className="faq-item" key={`${item.question}-${index}`}>
              <summary style={getTextStyle(faq, `items.${index}.question`)}>{item.question}</summary>
              <p style={getTextStyle(faq, `items.${index}.answer`)}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
