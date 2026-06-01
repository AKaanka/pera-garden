import type { HeroContent, SiteContentRow } from "../../types";
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

export async function getPublishedHero(): Promise<SiteContentRow<HeroContent>> {
  if (!supabase) {
    return {
      id: "fallback",
      section_key: "hero",
      status: "published",
      order_index: 0,
      default_locale: "tr",
      content: fallbackHeroContent,
      published_at: null,
      updated_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("section_key", "hero")
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    ...(data as SiteContentRow<unknown> | null),
    id: data?.id ?? "fallback",
    section_key: "hero",
    status: "published",
    order_index: data?.order_index ?? 0,
    default_locale: data?.default_locale ?? "tr",
    content: normalizeHeroContent(data?.content),
    published_at: data?.published_at ?? null,
    updated_at: data?.updated_at ?? new Date().toISOString(),
  };
}

export async function getAdminHeroRows() {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("section_key", "hero")
    .in("status", ["draft", "published"]);

  if (error) {
    throw error;
  }

  const draft = data?.find((row) => row.status === "draft") as SiteContentRow<unknown> | undefined;
  const published = data?.find((row) => row.status === "published") as
    | SiteContentRow<unknown>
    | undefined;

  return {
    draft: draft
      ? {
          ...draft,
          content: normalizeHeroContent(draft.content),
        }
      : null,
    published: published
      ? {
          ...published,
          content: normalizeHeroContent(published.content),
        }
      : null,
  };
}

export async function saveHeroDraft(content: HeroContent) {
  const supabase = requireSupabaseClient();
  const { data: userResult } = await supabase.auth.getUser();
  const updatedBy = userResult.user?.id ?? null;

  const { error } = await supabase
    .from("site_content")
    .update({
      content,
      updated_by: updatedBy,
    })
    .eq("section_key", "hero")
    .eq("status", "draft");

  if (error) {
    throw error;
  }
}

export async function publishHero(content: HeroContent) {
  const supabase = requireSupabaseClient();
  const { data: userResult } = await supabase.auth.getUser();
  const publishedBy = userResult.user?.id ?? null;

  const { error } = await supabase
    .from("site_content")
    .update({
      content,
      published_at: new Date().toISOString(),
      published_by: publishedBy,
      updated_by: publishedBy,
    })
    .eq("section_key", "hero")
    .eq("status", "published");

  if (error) {
    throw error;
  }
}

export function getPublicImageUrl(bucket: string, path: string) {
  if (!supabase || !path) {
    return "";
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
