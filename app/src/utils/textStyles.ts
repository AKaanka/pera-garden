import type { CSSProperties } from "react";
import type { TextStyle, TextStyleMap } from "../types";

type StylableTextContent = {
  textStyles?: TextStyleMap;
};

const FONT_FAMILY_MAP: Record<NonNullable<TextStyle["fontFamily"]>, string | undefined> = {
  inherit: undefined,
  serif: 'Georgia, "Times New Roman", serif',
  garamond: '"Cormorant Garamond", Garamond, Georgia, serif',
  times: '"Times New Roman", Times, serif',
  sans: 'Inter, "Helvetica Neue", Arial, sans-serif',
  modernSans: '"Avenir Next", Montserrat, Inter, "Helvetica Neue", Arial, sans-serif',
  displaySerif: 'Didot, "Bodoni 72", "Playfair Display", Georgia, serif',
  romanDisplay: 'Cinzel, Trajan, "Times New Roman", serif',
  script: '"Snell Roundhand", "Brush Script MT", cursive',
  handwritten: '"Segoe Script", "Bradley Hand", "Comic Sans MS", cursive',
  mono: '"Courier New", Courier, monospace',
};

export const DEFAULT_TEXT_STYLE: Required<Pick<TextStyle, "fontFamily" | "color" | "isBold" | "isItalic">> = {
  fontFamily: "inherit",
  color: "#2b2621",
  isBold: false,
  isItalic: false,
};

function cleanTextStyle(style: Partial<TextStyle> | undefined) {
  if (!style) {
    return undefined;
  }

  const next: TextStyle = {};

  if (typeof style.fontSize === "number" && Number.isFinite(style.fontSize)) {
    next.fontSize = Math.min(120, Math.max(10, style.fontSize));
  }

  if (typeof style.isBold === "boolean") {
    next.isBold = style.isBold;
  }

  if (typeof style.isItalic === "boolean") {
    next.isItalic = style.isItalic;
  }

  if (style.fontFamily && style.fontFamily in FONT_FAMILY_MAP) {
    next.fontFamily = style.fontFamily;
  }

  if (typeof style.color === "string" && /^#[0-9a-f]{6}$/i.test(style.color)) {
    next.color = style.color;
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

export function normalizeTextStyles(textStyles: unknown): TextStyleMap {
  if (!textStyles || typeof textStyles !== "object") {
    return {};
  }

  return Object.entries(textStyles as Record<string, Partial<TextStyle>>).reduce<TextStyleMap>((acc, [key, value]) => {
    const cleaned = cleanTextStyle(value);

    if (cleaned) {
      acc[key] = cleaned;
    }

    return acc;
  }, {});
}

export function getTextStyle(content: StylableTextContent | undefined, key: string): CSSProperties | undefined {
  const style = content?.textStyles?.[key];

  if (!style) {
    return undefined;
  }

  return {
    color: style.color,
    fontFamily: style.fontFamily ? FONT_FAMILY_MAP[style.fontFamily] : undefined,
    fontSize: typeof style.fontSize === "number" ? `${style.fontSize}px` : undefined,
    fontStyle: style.isItalic ? "italic" : undefined,
    fontWeight: style.isBold ? 700 : undefined,
  };
}

export function updateTextStyleMap<T extends StylableTextContent>(
  content: T,
  key: string,
  patch: Partial<TextStyle>,
): T {
  const nextStyles = { ...(content.textStyles ?? {}) };
  const current = nextStyles[key] ?? {};
  const cleaned = cleanTextStyle({
    ...current,
    ...patch,
  });

  if (cleaned) {
    nextStyles[key] = cleaned;
  } else {
    delete nextStyles[key];
  }

  return {
    ...content,
    textStyles: nextStyles,
  };
}

export function resetTextStyleMap<T extends StylableTextContent>(content: T, key: string): T {
  const nextStyles = { ...(content.textStyles ?? {}) };
  delete nextStyles[key];

  return {
    ...content,
    textStyles: nextStyles,
  };
}
