import type { Locale, LocationContent } from "../types";
import { getSectionBackgroundStyle } from "../utils/sectionBackground";
import { getTextStyle } from "../utils/textStyles";

type LocationProps = {
  content: LocationContent;
  locale: Locale;
  mapHref?: string;
};

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href.trim());
}

export function Location({ content, locale, mapHref }: LocationProps) {
  const location = content[locale] ?? content.tr;
  const ownHref = location.directionsHref?.trim();
  const sharedMapHref = mapHref?.trim();
  // Prefer the section's own directions URL; otherwise fall back to the venue
  // maps link the contact button uses, so "Yol tarifi al" always opens
  // Google Maps. A real maps URL opens in a new tab; an in-page anchor still
  // scrolls within the page.
  const directionsHref =
    ownHref && isExternalHref(ownHref)
      ? ownHref
      : sharedMapHref && isExternalHref(sharedMapHref)
        ? sharedMapHref
        : ownHref;
  const directionsIsExternal = directionsHref ? isExternalHref(directionsHref) : false;

  return (
    <section className="location-section" id="location" aria-labelledby="location-title" style={getSectionBackgroundStyle(content)}>
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
          {directionsHref && location.directionsLabel?.trim() ? (
            <a
              className="primary-action compact-action"
              href={directionsHref}
              rel={directionsIsExternal ? "noreferrer" : undefined}
              style={getTextStyle(location, "directionsLabel")}
              target={directionsIsExternal ? "_blank" : undefined}
            >
              {location.directionsLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
