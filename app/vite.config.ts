import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "pera-garden-html-seo",
      transformIndexHtml(html) {
        const siteUrl = process.env.VITE_SITE_URL?.replace(/\/+$/, "");
        const configuredSocialImageUrl = process.env.VITE_SOCIAL_IMAGE_URL || "/favicon.svg";

        if (!siteUrl) {
          return html;
        }

        const canonicalUrl = `${siteUrl}/`;
        const socialImageUrl = /^https?:\/\//i.test(configuredSocialImageUrl)
          ? configuredSocialImageUrl
          : new URL(configuredSocialImageUrl, canonicalUrl).toString();
        const siteJsonLd = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Pera Garden",
          url: canonicalUrl,
          inLanguage: "tr-TR",
        };
        const venueJsonLd = {
          "@context": "https://schema.org",
          "@type": "EventVenue",
          name: "Pera Garden",
          url: canonicalUrl,
          image: socialImageUrl,
        };
        const tags = [
          `<link rel="canonical" href="${canonicalUrl}" />`,
          `<meta property="og:url" content="${canonicalUrl}" />`,
          `<meta property="og:image" content="${socialImageUrl}" />`,
          `<meta name="twitter:image" content="${socialImageUrl}" />`,
          `<script type="application/ld+json" data-seo-id="site-static">${JSON.stringify(siteJsonLd)}</script>`,
          `<script type="application/ld+json" data-seo-id="venue-static">${JSON.stringify(venueJsonLd)}</script>`,
        ].join("\n    ");

        return html.replace("</head>", `    ${tags}\n  </head>`);
      },
    },
  ],
});
