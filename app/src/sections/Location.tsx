import type { Locale, LocationContent } from "../types";
import { getTextStyle } from "../utils/textStyles";

type LocationProps = {
  content: LocationContent;
  locale: Locale;
};

export function Location({ content, locale }: LocationProps) {
  const location = content[locale] ?? content.tr;

  return (
    <section className="location-section" id="location" aria-labelledby="location-title">
      <div className="section-shell location-shell">
        <div className="location-copy">
          <p className="eyebrow" style={getTextStyle(location, "eyebrow")}>{location.eyebrow}</p>
          <h2 id="location-title" style={getTextStyle(location, "title")}>{location.title}</h2>
          <p style={getTextStyle(location, "body")}>{location.body}</p>
        </div>

        <div className="location-details">
          <p className="location-label" style={getTextStyle(location, "addressLabel")}>{location.addressLabel}</p>
          <address style={getTextStyle(location, "address")}>{location.address}</address>
          <p style={getTextStyle(location, "note")}>{location.note}</p>
          <a className="primary-action compact-action" href={location.directionsHref} style={getTextStyle(location, "directionsLabel")}>
            {location.directionsLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
