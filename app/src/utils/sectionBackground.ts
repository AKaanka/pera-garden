import type { CSSProperties } from "react";
import type { SectionBackground, SectionKey } from "../types";

// The three selectable section backgrounds — the warm palette tones used across
// the public site. `label` is shown in the admin picker.
export const SECTION_BACKGROUND_OPTIONS: {
  id: SectionBackground;
  label: string;
  color: string;
}[] = [
  { id: "paper", label: "Krem", color: "#fffdf8" },
  { id: "beige", label: "Bej", color: "#f5efe6" },
  { id: "tan", label: "Kum", color: "#f1eadf" },
];

const colorById: Record<SectionBackground, string> = {
  paper: "#fffdf8",
  beige: "#f5efe6",
  tan: "#f1eadf",
};

export function isSectionBackground(value: unknown): value is SectionBackground {
  return value === "paper" || value === "beige" || value === "tan";
}

export function getSectionBackgroundColor(background: unknown): string | undefined {
  return isSectionBackground(background) ? colorById[background] : undefined;
}

// Inline style for a section root. Returns undefined when no preset is chosen,
// so the section keeps its default CSS background.
export function getSectionBackgroundStyle(content?: { background?: unknown }): CSSProperties | undefined {
  const color = getSectionBackgroundColor(content?.background);
  return color ? { background: color } : undefined;
}

// Each section's original (default) background, so the admin picker can show the
// current color even when no explicit override has been saved.
const defaultBySection: Partial<Record<SectionKey, SectionBackground>> = {
  about: "paper",
  services: "beige",
  gallery: "paper",
  slider: "tan",
  location: "paper",
  faq: "beige",
  contact: "beige",
};

export function getDefaultSectionBackground(sectionKey: SectionKey): SectionBackground {
  return defaultBySection[sectionKey] ?? "paper";
}

export function getEffectiveSectionBackground(
  sectionKey: SectionKey,
  content?: { background?: unknown },
): SectionBackground {
  return isSectionBackground(content?.background)
    ? content.background
    : getDefaultSectionBackground(sectionKey);
}
