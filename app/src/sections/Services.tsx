import type { Locale, ServicesContent } from "../types";

type ServicesProps = {
  content: ServicesContent;
  locale: Locale;
};

export function Services({ content, locale }: ServicesProps) {
  const services = content[locale] ?? content.tr;

  return (
    <section className="services-section" aria-labelledby="services-title">
      <div className="section-shell services-shell">
        <div className="services-heading">
          <p className="eyebrow">{services.eyebrow}</p>
          <h2 id="services-title">{services.title}</h2>
          <p>{services.subtitle}</p>
        </div>

        <div className="services-list">
          {services.items.map((item, index) => (
            <article className="service-item" key={`${item.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
