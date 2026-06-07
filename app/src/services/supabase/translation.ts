import type { AnySectionContent, SectionKey } from "../../types";

type BrowserTranslator = {
  translate: (text: string) => Promise<string>;
};

type BrowserTranslatorConstructor = {
  availability?: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<BrowserTranslator>;
};

const nonTextKeys = new Set([
  "bucket",
  "color",
  "email",
  "fontFamily",
  "fontSize",
  "href",
  "id",
  "isBold",
  "isItalic",
  "isPublished",
  "path",
  "type",
]);

function getBrowserTranslator() {
  return (globalThis as typeof globalThis & { Translator?: BrowserTranslatorConstructor }).Translator;
}

function isProbablyNonTextValue(value: string) {
  const trimmed = value.trim();

  return (
    trimmed === "" ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("@") ||
    /^https?:\/\//i.test(trimmed) ||
    /^(tel|mailto|sms|whatsapp):/i.test(trimmed) ||
    /^[\w.-]+@[\w.-]+\.\w+$/i.test(trimmed) ||
    /^\+?[\d\s().-]{7,}$/.test(trimmed)
  );
}

function shouldTranslateString(key: string, path: string[], value: string) {
  if (path.includes("textStyles")) {
    return false;
  }

  if (nonTextKeys.has(key) || key.endsWith("Href") || key.endsWith("Id")) {
    return false;
  }

  return !isProbablyNonTextValue(value);
}

async function translateValue(value: unknown, translator: BrowserTranslator, path: string[]): Promise<unknown> {
  if (typeof value === "string") {
    const key = path[path.length - 1] ?? "";

    return shouldTranslateString(key, path, value) ? translator.translate(value) : value;
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item, index) => translateValue(item, translator, [...path, String(index)])));
  }

  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, childValue]) => [
        key,
        await translateValue(childValue, translator, [...path, key]),
      ]),
    );

    return Object.fromEntries(entries);
  }

  return value;
}

export async function translateTurkishContentToEnglish(_sectionKey: SectionKey, content: AnySectionContent) {
  const Translator = getBrowserTranslator();

  if (!Translator) {
    throw new Error(
      "Free browser translation is not available in this browser. Use the latest desktop Chrome and enable built-in Translator support if needed.",
    );
  }

  const availability = Translator.availability
    ? await Translator.availability({ sourceLanguage: "tr", targetLanguage: "en" })
    : "available";

  if (availability === "unavailable") {
    throw new Error("Turkish to English translation is not available in this browser.");
  }

  const translator = await Translator.create({
    sourceLanguage: "tr",
    targetLanguage: "en",
  });
  const translatedEnglish = await translateValue(content.tr, translator, ["en"]);

  return {
    ...content,
    en: translatedEnglish,
  } as AnySectionContent;
}
