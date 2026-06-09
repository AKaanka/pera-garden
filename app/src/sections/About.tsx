import type { AboutContent, Locale } from "../types";
import { getSectionBackgroundStyle } from "../utils/sectionBackground";
import { getTextStyle } from "../utils/textStyles";

type AboutProps = {
  content: AboutContent;
  locale: Locale;
};

export function About({ content, locale }: AboutProps) {
  const about = content[locale] ?? content.tr;
  const highlightsLabel = locale === "tr" ? "Pera Garden özellikleri" : "Pera Garden highlights";

  return (
    <section className="about-section" id="about" aria-labelledby="about-title" style={getSectionBackgroundStyle(content)}>
      <div className="section-shell about-shell">
        <div className="about-story">
          <p className="eyebrow" style={getTextStyle(about, "eyebrow")}>
            {about.eyebrow}
          </p>
          <h2 id="about-title" style={getTextStyle(about, "title")}>
            {about.title}
          </h2>
          <p className="about-body" style={getTextStyle(about, "body")}>
            {about.body}
          </p>
        </div>

        <div className="about-experience" aria-label={highlightsLabel}>
          <div className="about-experience-header">
            <p style={getTextStyle(about, "experienceTitle")}>{about.experienceTitle}</p>
          </div>
          {about.highlights.map((highlight, index) => (
            <article className="about-highlight" key={`${highlight.title}-${index}`}>
              <span className="about-highlight-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 style={getTextStyle(about, `highlights.${index}.title`)}>{highlight.title}</h3>
                <p style={getTextStyle(about, `highlights.${index}.description`)}>{highlight.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
