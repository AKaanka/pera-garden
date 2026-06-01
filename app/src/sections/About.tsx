import type { AboutContent, Locale } from "../types";

type AboutProps = {
  content: AboutContent;
  locale: Locale;
};

export function About({ content, locale }: AboutProps) {
  const about = content[locale] ?? content.tr;

  return (
    <section className="about-section" aria-labelledby="about-title">
      <div className="section-shell about-shell">
        <div className="about-copy">
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 id="about-title">{about.title}</h2>
          <p>{about.body}</p>
        </div>

        <div className="about-highlights" aria-label="Pera Garden özellikleri">
          {about.highlights.map((highlight) => (
            <div key={highlight.title}>
              <strong>{highlight.title}</strong>
              <span>{highlight.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
