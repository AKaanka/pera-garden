export type RouteSeo = {
  title: string;
  description: string;
  noIndex?: boolean;
  imageUrl?: string;
};

const defaultSiteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/+$/, "") || "";
const defaultSocialImage = import.meta.env.VITE_SOCIAL_IMAGE_URL || "/favicon.svg";

export const defaultRouteSeo: RouteSeo = {
  title: "Pera Garden | Bahçe düğün ve davet mekânı",
  description: "Pera Garden düğün ve davet organizasyonları için sıcak, zarif ve ulaşımı kolay bir bahçe mekânı.",
  imageUrl: defaultSocialImage,
};

export const adminRouteSeo: RouteSeo = {
  title: "Pera Garden Admin",
  description: "Pera Garden içerik ve iletişim yönetimi.",
  noIndex: true,
};

function getBaseUrl() {
  if (defaultSiteUrl) {
    return defaultSiteUrl;
  }

  return typeof window === "undefined" ? "" : window.location.origin;
}

export function getAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl || "/", `${baseUrl}/`).toString();
}

export function getCanonicalUrl(pathname: string) {
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  return getAbsoluteUrl(normalizedPath || "/");
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  const head = document.head;
  const existing = head.querySelector<HTMLMetaElement>(selector);
  const element = existing ?? document.createElement("meta");

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  if (!existing) {
    head.appendChild(element);
  }
}

function upsertLink(rel: string, href: string) {
  const head = document.head;
  const selector = `link[rel="${rel}"]`;
  const existing = head.querySelector<HTMLLinkElement>(selector);
  const element = existing ?? document.createElement("link");

  element.setAttribute("rel", rel);
  element.setAttribute("href", href);

  if (!existing) {
    head.appendChild(element);
  }
}

export function upsertJsonLd(id: string, data: Record<string, unknown>) {
  const head = document.head;
  const selector = `script[type="application/ld+json"][data-seo-id="${id}"]`;
  const existing = head.querySelector<HTMLScriptElement>(selector);
  const element = existing ?? document.createElement("script");

  element.type = "application/ld+json";
  element.dataset.seoId = id;
  element.textContent = JSON.stringify(data);

  if (!existing) {
    head.appendChild(element);
  }
}

export function removeJsonLd(id: string) {
  document.head.querySelector(`script[type="application/ld+json"][data-seo-id="${id}"]`)?.remove();
}

export function applyRouteSeo(pathname: string, seo: RouteSeo) {
  const canonicalUrl = getCanonicalUrl(pathname);
  const imageUrl = getAbsoluteUrl(seo.imageUrl ?? defaultSocialImage);

  document.title = seo.title;
  upsertMeta('meta[name="description"]', { name: "description", content: seo.description });
  upsertMeta('meta[name="robots"]', {
    name: "robots",
    content: seo.noIndex ? "noindex, nofollow" : "index, follow",
  });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
  upsertLink("canonical", canonicalUrl);
}

export function getSiteJsonLd() {
  const siteUrl = getAbsoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pera Garden",
    url: siteUrl,
    inLanguage: "tr-TR",
  };
}

export function getVenueJsonLd() {
  const siteUrl = getAbsoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: "Pera Garden",
    url: siteUrl,
    image: getAbsoluteUrl(defaultRouteSeo.imageUrl ?? defaultSocialImage),
  };
}
