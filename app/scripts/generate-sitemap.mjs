import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(appRoot, "dist");
const sitemapPath = join(distDir, "sitemap.xml");
const robotsPath = join(distDir, "robots.txt");
const envFiles = [".env", ".env.local", ".env.production", ".env.production.local"];
const publicRoutes = ["/"];

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

function getSiteUrl() {
  const fileEnv = envFiles.reduce(
    (values, fileName) => ({ ...values, ...parseEnvFile(join(appRoot, fileName)) }),
    {},
  );
  const siteUrl = process.env.VITE_SITE_URL || fileEnv.VITE_SITE_URL || "";

  return siteUrl.replace(/\/+$/, "");
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getRouteUrl(siteUrl, route) {
  return new URL(route, `${siteUrl}/`).toString();
}

function writeSitemap(siteUrl) {
  const urls = publicRoutes
    .map((route) => `  <url>\n    <loc>${escapeXml(getRouteUrl(siteUrl, route))}</loc>\n  </url>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  mkdirSync(distDir, { recursive: true });
  writeFileSync(sitemapPath, sitemap, "utf8");
}

function writeRobotsSitemapLine(siteUrl) {
  const sitemapUrl = getRouteUrl(siteUrl, "/sitemap.xml");
  const currentRobots = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8").trimEnd() : "";
  const robotsWithoutSitemap = currentRobots
    .split(/\r?\n/)
    .filter((line) => !/^sitemap:/i.test(line.trim()))
    .join("\n")
    .trimEnd();
  const nextRobots = `${robotsWithoutSitemap}\nSitemap: ${sitemapUrl}\n`;

  writeFileSync(robotsPath, nextRobots, "utf8");
}

const siteUrl = getSiteUrl();

if (!siteUrl) {
  console.log("Skipping sitemap generation because VITE_SITE_URL is not set.");
} else {
  writeSitemap(siteUrl);
  writeRobotsSitemapLine(siteUrl);
  console.log(`Generated sitemap.xml for ${siteUrl}.`);
}
