import type { Locale, ServicesContent } from "../types";
import { getPublicImageUrl } from "../services/supabase/content";
import { getSectionBackgroundStyle } from "../utils/sectionBackground";
import { getTextStyle } from "../utils/textStyles";

type ServicesProps = {
  content: ServicesContent;
  locale: Locale;
};

export function Services({ content, locale }: ServicesProps) {
  const services = content[locale] ?? content.tr;
  const visibleItems = services.items.filter((item) => item.isPublished);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="services-section" id="services" aria-labelledby="services-title" style={getSectionBackgroundStyle(content)}>
      <div className="section-shell services-shell">
        <div className="services-heading">
          <p className="eyebrow" style={getTextStyle(services, "eyebrow")}>{services.eyebrow}</p>
          <h2 id="services-title" style={getTextStyle(services, "title")}>{services.title}</h2>
          <p style={getTextStyle(services, "subtitle")}>{services.subtitle}</p>
        </div>

        <div className="services-list">
          {visibleItems.map((item, index) => (
            <article className="service-item" key={`${item.title}-${index}`}>
              <div className="service-image">
                {item.image.path ? (
                  <img src={getPublicImageUrl(item.image.bucket, item.image.path)} alt={item.image.alt} />
                ) : (
                  <div className="service-image-empty" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                )}
              </div>
              <div className="service-copy">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3 style={getTextStyle(services, `items.${index}.title`)}>{item.title}</h3>
                <p style={getTextStyle(services, `items.${index}.description`)}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
