import type {
  AboutContent,
  AnySectionContent,
  HeroContent,
  SectionContentMap,
  SectionKey,
  SiteContentRow,
  SliderContent,
} from "../../types";
import { requireSupabaseClient, supabase } from "./client";

export const fallbackHeroContent: HeroContent = {
  tr: {
    eyebrow: "Pera Garden",
    title: "Düğününüz için zamansız bir bahçe",
    subtitle:
      "Sevdiklerinizle bir araya geleceğiniz, fotoğraf gibi hatırlanan zarif bir açık hava davet alanı.",
    primaryCtaLabel: "Rezervasyon iste",
    primaryCtaHref: "#contact",
    image: {
      bucket: "hero",
      path: "",
      alt: "Pera Garden düğün alanı",
    },
  },
  en: {
    eyebrow: "Pera Garden",
    title: "A timeless garden for your wedding",
    subtitle:
      "An elegant outdoor venue for celebrations that feel intimate, warm, and beautifully remembered.",
    primaryCtaLabel: "Request a reservation",
    primaryCtaHref: "#contact",
    image: {
      bucket: "hero",
      path: "",
      alt: "Pera Garden wedding venue",
    },
  },
};

export const fallbackAboutContent: AboutContent = {
  tr: {
    eyebrow: "Pera Garden deneyimi",
    title: "Şehrin ritminden uzak, davetinize yakın",
    body:
      "Pera Garden; açık hava ferahlığını, özenli servis akışını ve sade bir zarafeti aynı bahçede buluşturur. Nikâh, yemek ve kutlama anları için planlanan alan, misafirlerinizin rahatça hareket edebileceği sıcak bir atmosfer sunar.",
    highlights: [
      {
        title: "Bahçe atmosferi",
        description: "Doğal ışık, yeşil doku ve fotoğraf dostu açık alanlar.",
      },
      {
        title: "Akıcı organizasyon",
        description: "Karşılama, tören, yemek ve kutlama akışı tek planda düşünülür.",
      },
      {
        title: "Samimi ölçek",
        description: "Gösterişli ama yorucu olmayan, davetlilerinize yakın hissettiren bir düzen.",
      },
    ],
  },
  en: {
    eyebrow: "Pera Garden experience",
    title: "Away from the rush, close to your celebration",
    body:
      "Pera Garden brings open-air freshness, thoughtful service flow, and quiet elegance into one garden setting for ceremonies, dinners, and warm celebrations.",
    highlights: [
      {
        title: "Garden atmosphere",
        description: "Natural light, greenery, and photo-friendly outdoor spaces.",
      },
      {
        title: "Smooth organization",
        description: "Welcoming, ceremony, dinner, and celebration flow planned together.",
      },
      {
        title: "Intimate scale",
        description: "A graceful setting that feels close and comfortable for your guests.",
      },
    ],
  },
};

export const fallbackSliderContent: SliderContent = {
  tr: {
    eyebrow: "Davet akışı",
    title: "Gününüzü taşıyan küçük ama önemli anlar",
    subtitle:
      "Pera Garden, hazırlık heyecanından son dansa kadar her adımı yalın ve anlaşılır bir akışla destekler.",
    slides: [
      {
        title: "Karşılama",
        description: "Misafirleriniz bahçe atmosferine sakin, düzenli ve sıcak bir başlangıçla adım atar.",
      },
      {
        title: "Tören",
        description: "Nikâh ve kutlama alanı, anın merkezinde kalmanız için sade bir düzenle hazırlanır.",
      },
      {
        title: "Kutlama",
        description: "Yemek, müzik ve dans akışı davetlilerinizle doğal bir ritimde ilerler.",
      },
    ],
  },
  en: {
    eyebrow: "Celebration flow",
    title: "Small moments that carry the whole day",
    subtitle:
      "From the first welcome to the last dance, Pera Garden supports each step with a clear and graceful flow.",
    slides: [
      {
        title: "Welcome",
        description: "Guests step into the garden with a calm, organized, and warm first impression.",
      },
      {
        title: "Ceremony",
        description: "The ceremony setting is prepared simply, keeping the moment at the center.",
      },
      {
        title: "Celebration",
        description: "Dinner, music, and dancing move with a natural rhythm for your guests.",
      },
    ],
  },
};

const fallbackContent: SectionContentMap = {
  hero: fallbackHeroContent,
  about: fallbackAboutContent,
  slider: fallbackSliderContent,
};

const fallbackOrder: SectionKey[] = ["hero", "about", "slider"];

export const sectionLabels: Record<SectionKey, string> = {
  hero: "Hero",
  about: "About",
  slider: "Slider",
};

function normalizeHeroContent(content: unknown): HeroContent {
  const candidate = content as Partial<HeroContent> | null;

  return {
    tr: {
      ...fallbackHeroContent.tr,
      ...(candidate?.tr ?? {}),
      image: {
        ...fallbackHeroContent.tr.image,
        ...(candidate?.tr?.image ?? {}),
      },
    },
    en: {
      ...fallbackHeroContent.en,
      ...(candidate?.en ?? {}),
      image: {
        ...fallbackHeroContent.en.image,
        ...(candidate?.en?.image ?? {}),
      },
    },
  };
}

function normalizeAboutContent(content: unknown): AboutContent {
  const candidate = content as Partial<AboutContent> | null;

  return {
    tr: {
      ...fallbackAboutContent.tr,
      ...(candidate?.tr ?? {}),
      highlights: candidate?.tr?.highlights?.length
        ? candidate.tr.highlights
        : fallbackAboutContent.tr.highlights,
    },
    en: {
      ...fallbackAboutContent.en,
      ...(candidate?.en ?? {}),
      highlights: candidate?.en?.highlights?.length
        ? candidate.en.highlights
        : fallbackAboutContent.en.highlights,
    },
  };
}

function normalizeSliderContent(content: unknown): SliderContent {
  const candidate = content as Partial<SliderContent> | null;

  return {
    tr: {
      ...fallbackSliderContent.tr,
      ...(candidate?.tr ?? {}),
      slides: candidate?.tr?.slides?.length ? candidate.tr.slides : fallbackSliderContent.tr.slides,
    },
    en: {
      ...fallbackSliderContent.en,
      ...(candidate?.en ?? {}),
      slides: candidate?.en?.slides?.length ? candidate.en.slides : fallbackSliderContent.en.slides,
    },
  };
}

export function normalizeSectionContent<TKey extends SectionKey>(
  sectionKey: TKey,
  content: unknown,
): SectionContentMap[TKey] {
  if (sectionKey === "about") {
    return normalizeAboutContent(content) as SectionContentMap[TKey];
  }

  if (sectionKey === "slider") {
    return normalizeSliderContent(content) as SectionContentMap[TKey];
  }

  return normalizeHeroContent(content) as SectionContentMap[TKey];
}

function fallbackRow<TKey extends SectionKey>(
  sectionKey: TKey,
  orderIndex: number,
  status: "draft" | "published" = "published",
): SiteContentRow<SectionContentMap[TKey]> {
  return {
    id: `fallback-${sectionKey}-${status}`,
    section_key: sectionKey,
    status,
    order_index: orderIndex,
    default_locale: "tr",
    content: fallbackContent[sectionKey],
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

function normalizeRow(row: SiteContentRow<unknown>): SiteContentRow {
  return {
    ...row,
    content: normalizeSectionContent(row.section_key, row.content),
  };
}

function mergeWithFallbackRows(rows: SiteContentRow[], status: "draft" | "published") {
  const presentSections = new Set(rows.map((row) => row.section_key));
  const missingRows = fallbackOrder
    .filter((sectionKey) => !presentSections.has(sectionKey))
    .map((sectionKey, index) => fallbackRow(sectionKey, rows.length + index, status));

  return [...rows, ...missingRows].sort((left, right) => left.order_index - right.order_index);
}

export async function getPublishedSections(): Promise<SiteContentRow[]> {
  if (!supabase) {
    return fallbackOrder.map((sectionKey, index) => fallbackRow(sectionKey, index));
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("status", "published")
    .order("order_index", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as SiteContentRow<unknown>[];
  const normalizedRows = rows.map(normalizeRow);

  if (normalizedRows.length === 0) {
    return fallbackOrder.map((sectionKey, index) => fallbackRow(sectionKey, index));
  }

  return mergeWithFallbackRows(normalizedRows, "published");
}

export async function getPublishedHero(): Promise<SiteContentRow<HeroContent>> {
  const rows = await getPublishedSections();
  const hero = rows.find((row) => row.section_key === "hero") as SiteContentRow<HeroContent> | undefined;

  return hero ?? fallbackRow("hero", 0);
}

export async function getAdminSectionRows() {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("status", "draft")
    .order("order_index", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as SiteContentRow<unknown>[]).map(normalizeRow);

  return mergeWithFallbackRows(rows, "draft");
}

export async function getAdminSectionRow<TKey extends SectionKey>(sectionKey: TKey) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("section_key", sectionKey)
    .eq("status", "draft")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return fallbackRow(sectionKey, fallbackOrder.indexOf(sectionKey), "draft");
  }

  return normalizeRow(data as SiteContentRow<unknown>) as SiteContentRow<SectionContentMap[TKey]>;
}

export async function getAdminHeroRows() {
  const draft = await getAdminSectionRow("hero");

  return {
    draft,
    published: null,
  };
}

export async function saveSectionDraft(sectionKey: SectionKey, content: AnySectionContent) {
  const supabase = requireSupabaseClient();
  const { data: userResult } = await supabase.auth.getUser();
  const updatedBy = userResult.user?.id ?? null;

  const { data, error } = await supabase
    .from("site_content")
    .update({
      content,
      updated_by: updatedBy,
    })
    .eq("section_key", sectionKey)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Section row is missing. Apply the latest Supabase migration before saving.");
  }
}

export async function publishSection(sectionKey: SectionKey, content: AnySectionContent) {
  const supabase = requireSupabaseClient();
  const { data: userResult } = await supabase.auth.getUser();
  const publishedBy = userResult.user?.id ?? null;

  const { data, error } = await supabase
    .from("site_content")
    .update({
      content,
      published_at: new Date().toISOString(),
      published_by: publishedBy,
      updated_by: publishedBy,
    })
    .eq("section_key", sectionKey)
    .eq("status", "published")
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Published section row is missing. Apply the latest Supabase migration before publishing.");
  }
}

export async function saveHeroDraft(content: HeroContent) {
  await saveSectionDraft("hero", content);
}

export async function publishHero(content: HeroContent) {
  await publishSection("hero", content);
}

export async function saveSectionOrder(sectionKeys: SectionKey[]) {
  const supabase = requireSupabaseClient();

  const results = await Promise.all(
    sectionKeys.flatMap((sectionKey, orderIndex) => [
      supabase
        .from("site_content")
        .update({ order_index: orderIndex })
        .eq("section_key", sectionKey)
        .eq("status", "draft")
        .select("id"),
      supabase
        .from("site_content")
        .update({ order_index: orderIndex })
        .eq("section_key", sectionKey)
        .eq("status", "published")
        .select("id"),
    ]),
  );

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw failed.error;
  }

  if (results.some((result) => !result.data?.length)) {
    throw new Error("Some section rows are missing. Apply the latest Supabase migration before saving order.");
  }
}

export function getPublicImageUrl(bucket: string, path: string) {
  if (!supabase || !path) {
    return "";
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
