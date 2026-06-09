import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(appRoot, "dist");
const envFiles = [".env", ".env.local", ".env.production", ".env.production.local"];
const checks = [];
const failures = [];

function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return values;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return values;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      return key ? { ...values, [key]: value } : values;
    }, {});
}

function getEnvValues() {
  const fileEnv = envFiles.reduce(
    (values, fileName) => ({ ...values, ...parseEnvFile(join(appRoot, fileName)) }),
    {},
  );

  return {
    ...fileEnv,
    ...process.env,
  };
}

function getSiteUrl(envValues) {
  const siteUrl = envValues.VITE_SITE_URL || "";

  return siteUrl.replace(/\/+$/, "");
}

function getSocialImageUrl(envValues, siteUrl) {
  const configuredSocialImageUrl = envValues.VITE_SOCIAL_IMAGE_URL || "/favicon.svg";

  if (/^https?:\/\//i.test(configuredSocialImageUrl)) {
    return configuredSocialImageUrl;
  }

  return new URL(configuredSocialImageUrl, `${siteUrl}/`).toString();
}

function readRequiredFile(relativePath) {
  const path = join(distDir, relativePath);

  if (!existsSync(path)) {
    failures.push(`${relativePath} is missing from dist.`);
    return "";
  }

  return readFileSync(path, "utf8");
}

function expect(name, condition, message) {
  checks.push(name);

  if (!condition) {
    failures.push(message);
  }
}

const indexHtml = readRequiredFile("index.html");
const robots = readRequiredFile("robots.txt");
const headers = readRequiredFile("_headers");
const envValues = getEnvValues();
const siteUrl = getSiteUrl(envValues);

expect("document language", /<html\s+[^>]*lang="tr"/i.test(indexHtml), "index.html must declare lang=\"tr\".");
expect("static title", /<title>[^<]+<\/title>/i.test(indexHtml), "index.html must include a static title.");
expect(
  "static description",
  /<meta\s+[^>]*name="description"[^>]*content="[^"]+"/i.test(indexHtml) ||
    /<meta\s+[^>]*content="[^"]+"[^>]*name="description"/i.test(indexHtml),
  "index.html must include a static meta description.",
);
expect(
  "static open graph title",
  /<meta\s+[^>]*property="og:title"[^>]*content="[^"]+"/i.test(indexHtml) ||
    /<meta\s+[^>]*content="[^"]+"[^>]*property="og:title"/i.test(indexHtml),
  "index.html must include a static og:title.",
);
expect(
  "static twitter card",
  /<meta\s+[^>]*name="twitter:card"[^>]*content="summary_large_image"/i.test(indexHtml) ||
    /<meta\s+[^>]*content="summary_large_image"[^>]*name="twitter:card"/i.test(indexHtml),
  "index.html must include a summary_large_image Twitter card.",
);
expect("robots admin block", /Disallow:\s*\/admin\b/i.test(robots), "robots.txt must disallow /admin.");
expect(
  "headers admin noindex",
  /\/admin[\s\S]*X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/i.test(headers),
  "_headers must set X-Robots-Tag for /admin.",
);
expect(
  "headers admin wildcard noindex",
  /\/admin\/\*[\s\S]*X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/i.test(headers),
  "_headers must set X-Robots-Tag for /admin/*.",
);

if (siteUrl) {
  const sitemap = readRequiredFile("sitemap.xml");
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const canonicalUrl = `${siteUrl}/`;
  const socialImageUrl = getSocialImageUrl(envValues, siteUrl);

  expect("sitemap root url", sitemap.includes(`<loc>${siteUrl}/</loc>`), "sitemap.xml must include the site root URL.");
  expect("robots sitemap line", robots.includes(`Sitemap: ${sitemapUrl}`), "robots.txt must include the sitemap URL.");
  expect(
    "static canonical url",
    indexHtml.includes(`<link rel="canonical" href="${canonicalUrl}"`),
    "index.html must include a production canonical URL when VITE_SITE_URL is set.",
  );
  expect(
    "static open graph url",
    indexHtml.includes(`<meta property="og:url" content="${canonicalUrl}"`),
    "index.html must include a production og:url when VITE_SITE_URL is set.",
  );
  expect(
    "static social images",
    indexHtml.includes(`<meta property="og:image" content="${socialImageUrl}"`) &&
      indexHtml.includes(`<meta name="twitter:image" content="${socialImageUrl}"`),
    "index.html must include production og:image and twitter:image when VITE_SITE_URL is set.",
  );
  expect(
    "static website json-ld",
    indexHtml.includes(`data-seo-id="site-static"`) &&
      indexHtml.includes(`"@type":"WebSite"`) &&
      indexHtml.includes(`"url":"${canonicalUrl}"`),
    "index.html must include static WebSite JSON-LD when VITE_SITE_URL is set.",
  );
  expect(
    "static venue json-ld",
    indexHtml.includes(`data-seo-id="venue-static"`) &&
      indexHtml.includes(`"@type":"EventVenue"`) &&
      indexHtml.includes(`"image":"${socialImageUrl}"`),
    "index.html must include static EventVenue JSON-LD when VITE_SITE_URL is set.",
  );
} else {
  expect(
    "local sitemap skip",
    !existsSync(join(distDir, "sitemap.xml")),
    "sitemap.xml should not be generated without VITE_SITE_URL.",
  );
}

if (failures.length > 0) {
  console.error(`SEO verification failed (${failures.length}/${checks.length} checks):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SEO verification passed (${checks.length} checks).`);
