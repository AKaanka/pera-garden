import type { AboutContent, Locale } from "../types";
import { getTextStyle } from "../utils/textStyles";

type AboutProps = {
  content: AboutContent;
  locale: Locale;
};

export function About({ content, locale }: AboutProps) {
  const about = content[locale] ?? content.tr;

  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="section-shell about-shell">
        <div className="about-copy">
          <p className="eyebrow" style={getTextStyle(about, "eyebrow")}>{about.eyebrow}</p>
          <h2 id="about-title" style={getTextStyle(about, "title")}>{about.title}</h2>
          <p style={getTextStyle(about, "body")}>{about.body}</p>
        </div>

        <div className="about-highlights" aria-label="Pera Garden özellikleri">
          {about.highlights.map((highlight, index) => (
            <div key={highlight.title}>
              <strong style={getTextStyle(about, `highlights.${index}.title`)}>{highlight.title}</strong>
              <span style={getTextStyle(about, `highlights.${index}.description`)}>{highlight.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
