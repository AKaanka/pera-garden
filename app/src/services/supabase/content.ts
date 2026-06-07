import type {
  AboutContent,
  AnySectionContent,
  BuiltInSectionKey,
  ChromeContent,
  ContactContent,
  CustomContent,
  FaqContent,
  GalleryContent,
  HeroContent,
  LocationContent,
  ServicesContent,
  SectionContentMap,
  SectionKey,
  SiteContentRow,
  SliderContent,
} from "../../types";
import { normalizeTextStyles } from "../../utils/textStyles";
import { requireSupabaseClient, supabase } from "./client";
import { isLocalMediaPath } from "./localMedia";

type SectionRowStatus = "draft" | "published";

export const fallbackChromeContent: ChromeContent = {
  tr: {
    brandLabel: "Pera Garden",
    logo: {
      bucket: "hero",
      path: "",
      alt: "Pera Garden logo",
    },
    navItems: [
      {
        label: "Hakkımızda",
        href: "#about",
      },
      {
        label: "Hizmetler",
        href: "#services",
      },
      {
        label: "Galeri",
        href: "#gallery",
      },
      {
        label: "Konum",
        href: "#location",
      },
    ],
    ctaLabel: "Rezervasyon",
    ctaHref: "#contact",
    instagramLabel: "Instagram",
    instagramHref: "https://www.instagram.com/",
    phoneLabel: "Ara",
    phoneHref: "tel:+900000000000",
    whatsappLabel: "WhatsApp",
    whatsappHref: "https://wa.me/900000000000",
    mapLabel: "Yol Tarifi",
    mapHref: "https://maps.google.com/",
    footerText: "Pera Garden",
    footerLinkLabel: "Admin",
    footerLinkHref: "/admin",
  },
  en: {
    brandLabel: "Pera Garden",
    logo: {
      bucket: "hero",
      path: "",
      alt: "Pera Garden logo",
    },
    navItems: [
      {
        label: "About",
        href: "#about",
      },
      {
        label: "Services",
        href: "#services",
      },
      {
        label: "Gallery",
        href: "#gallery",
      },
      {
        label: "Location",
        href: "#location",
      },
    ],
    ctaLabel: "Reservation",
    ctaHref: "#contact",
    instagramLabel: "Instagram",
    instagramHref: "https://www.instagram.com/",
    phoneLabel: "Call",
    phoneHref: "tel:+900000000000",
    whatsappLabel: "WhatsApp",
    whatsappHref: "https://wa.me/900000000000",
    mapLabel: "Directions",
    mapHref: "https://maps.google.com/",
    footerText: "Pera Garden",
    footerLinkLabel: "Admin",
    footerLinkHref: "/admin",
  },
};

export const fallbackHeroContent: HeroContent = {
  tr: {
    eyebrow: "Pera Garden",
    title: "Düğününüz için zamansız bir bahçe",
    subtitle:
      "Sevdiklerinizle bir araya geleceğiniz, fotoğraf gibi hatırlanan zarif bir açık hava davet alanı.",
    primaryCtaLabel: "Rezervasyon",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "Galeriyi Gör",
    secondaryCtaHref: "#gallery",
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
    primaryCtaLabel: "Book Now",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "View Gallery",
    secondaryCtaHref: "#gallery",
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

export const fallbackServicesContent: ServicesContent = {
  tr: {
    eyebrow: "Hizmetler",
    title: "Davetiniz için temel hazırlıklar",
    subtitle:
      "Pera Garden, düğün gününüzün ana ihtiyaçlarını tek bahçe akışında sade ve anlaşılır şekilde planlar.",
    items: [
      {
        title: "Nikâh ve karşılama alanı",
        description: "Misafir gelişi, tören düzeni ve ilk karşılama anları için planlanan açık hava kullanımı.",
        image: {
          bucket: "hero",
          path: "",
          alt: "Pera Garden nikâh ve karşılama alanı",
        },
        isPublished: true,
      },
      {
        title: "Yemek ve servis akışı",
        description: "Davet ritmine uygun masa düzeni, servis planı ve ekip koordinasyonu.",
        image: {
          bucket: "hero",
          path: "",
          alt: "Pera Garden yemek ve servis düzeni",
        },
        isPublished: true,
      },
      {
        title: "Müzik ve kutlama düzeni",
        description: "Günün finalini taşıyan dans, müzik ve kutlama alanı için pratik yerleşim.",
        image: {
          bucket: "hero",
          path: "",
          alt: "Pera Garden müzik ve kutlama alanı",
        },
        isPublished: true,
      },
    ],
  },
  en: {
    eyebrow: "Services",
    title: "Essentials for your celebration",
    subtitle:
      "Pera Garden keeps the main wedding-day needs clear, coordinated, and easy to follow in one garden flow.",
    items: [
      {
        title: "Ceremony and welcome area",
        description: "Outdoor use planned for guest arrival, ceremony layout, and the first welcome moments.",
        image: {
          bucket: "hero",
          path: "",
          alt: "Pera Garden ceremony and welcome area",
        },
        isPublished: true,
      },
      {
        title: "Dinner and service flow",
        description: "Table layout, service planning, and team coordination shaped around the celebration rhythm.",
        image: {
          bucket: "hero",
          path: "",
          alt: "Pera Garden dinner and service setup",
        },
        isPublished: true,
      },
      {
        title: "Music and celebration setup",
        description: "A practical layout for dancing, music, and the closing energy of the day.",
        image: {
          bucket: "hero",
          path: "",
          alt: "Pera Garden music and celebration setup",
        },
        isPublished: true,
      },
    ],
  },
};

export const fallbackGalleryContent: GalleryContent = {
  tr: {
    eyebrow: "Galeri",
    title: "Bahçeden kareler",
    subtitle:
      "Fotoğraf ve kısa videolarla Pera Garden atmosferini, davet düzenini ve günün ritmini görün.",
    items: [
      {
        id: "gallery-garden",
        type: "photo",
        bucket: "gallery",
        path: "",
        title: "Bahçe atmosferi",
        caption: "Pera Garden'ın açık hava davet hissini gösteren görselleri burada paylaşın.",
        alt: "Pera Garden bahçe atmosferi",
        isPublished: true,
      },
    ],
  },
  en: {
    eyebrow: "Gallery",
    title: "Moments from the garden",
    subtitle: "Share photos and short videos that show the atmosphere, layout, and rhythm of Pera Garden.",
    items: [
      {
        id: "gallery-garden",
        type: "photo",
        bucket: "gallery",
        path: "",
        title: "Garden atmosphere",
        caption: "Use this space to share visuals from Pera Garden's open-air celebration setting.",
        alt: "Pera Garden garden atmosphere",
        isPublished: true,
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

export const fallbackLocationContent: LocationContent = {
  tr: {
    eyebrow: "Konum",
    title: "Davetiniz için ulaşımı kolay bir buluşma noktası",
    body:
      "Pera Garden konum bilgileri ve yol tarifi detayları davet planınız netleştikçe burada güncellenir.",
    addressLabel: "Adres",
    address: "Adres bilgisi yakında eklenecek.",
    directionsLabel: "Yol tarifi al",
    directionsHref: "#contact",
    note: "Davetiniz için net yol tarifi ve otopark bilgisi paylaşmak isterseniz bu alanı admin panelinden güncelleyebilirsiniz.",
  },
  en: {
    eyebrow: "Location",
    title: "An easy meeting point for your celebration",
    body: "Pera Garden location and directions can be updated here as the final event details become clear.",
    addressLabel: "Address",
    address: "Address details will be added soon.",
    directionsLabel: "Get directions",
    directionsHref: "#contact",
    note: "Use the admin panel to add exact directions and parking notes when they are ready.",
  },
};

export const fallbackFaqContent: FaqContent = {
  tr: {
    eyebrow: "Sık sorulan sorular",
    title: "Planlama öncesi merak edilenler",
    subtitle:
      "Davetiniz için ilk görüşmeden önce en çok sorulan başlıkları kısa ve net şekilde yanıtladık.",
    items: [
      {
        question: "Pera Garden hangi tür davetler için uygundur?",
        answer:
          "Düğün, nişan, nikâh sonrası kutlama ve özel davetler için açık hava odaklı bir akış planlanabilir.",
      },
      {
        question: "Organizasyon akışı birlikte planlanıyor mu?",
        answer:
          "Evet. Karşılama, tören, yemek, müzik ve kutlama akışı davet beklentinize göre birlikte netleştirilir.",
      },
      {
        question: "Detaylı bilgi ve uygun tarih için nasıl iletişime geçilir?",
        answer:
          "Formu doldurduğunuzda ekip size dönüş yapar ve tarih, kişi sayısı, ihtiyaçlar gibi detayları birlikte konuşur.",
      },
    ],
  },
  en: {
    eyebrow: "FAQ",
    title: "Questions before planning",
    subtitle:
      "A short set of answers for the topics couples usually ask before the first conversation.",
    items: [
      {
        question: "What kind of events is Pera Garden suitable for?",
        answer:
          "The venue can support weddings, engagements, post-ceremony celebrations, and private outdoor gatherings.",
      },
      {
        question: "Is the event flow planned together?",
        answer:
          "Yes. Welcome, ceremony, dinner, music, and celebration flow are shaped around your expectations.",
      },
      {
        question: "How can we ask about details and available dates?",
        answer:
          "Send the form and the team will follow up to discuss date, guest count, and event needs.",
      },
    ],
  },
};

export const fallbackContactContent: ContactContent = {
  tr: {
    eyebrow: "Rezervasyon",
    title: "Tarih ve detayları konuşalım",
    description: "Bilgilerinizi bırakın; Pera Garden ekibi WhatsApp üzerinden size geri dönsün.",
    firstNameLabel: "Ad",
    lastNameLabel: "Soyad",
    phoneLabel: "Telefon",
    phoneHelp: "WhatsApp için ülke koduyla yazabilirsiniz: +90 ...",
    messageLabel: "Mesaj",
    submitLabel: "Rezervasyon isteği gönder",
  },
  en: {
    eyebrow: "Reservations",
    title: "Let's talk through your date and details",
    description: "Leave your details and the Pera Garden team will reply on WhatsApp.",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    phoneLabel: "Phone",
    phoneHelp: "Include a country code for WhatsApp if you can: +90 ...",
    messageLabel: "Message",
    submitLabel: "Send request",
  },
};

const fallbackContent: SectionContentMap = {
  chrome: fallbackChromeContent,
  hero: fallbackHeroContent,
  about: fallbackAboutContent,
  services: fallbackServicesContent,
  gallery: fallbackGalleryContent,
  slider: fallbackSliderContent,
  location: fallbackLocationContent,
  faq: fallbackFaqContent,
  contact: fallbackContactContent,
};

const builtInSectionKeys: BuiltInSectionKey[] = [
  "chrome",
  "hero",
  "about",
  "services",
  "gallery",
  "slider",
  "location",
  "faq",
  "contact",
];
const orderedSectionKeys: BuiltInSectionKey[] = [
  "hero",
  "about",
  "services",
  "gallery",
  "slider",
  "location",
  "faq",
  "contact",
];
const customSectionPattern = /^custom_[a-z0-9_]{3,64}$/;
const LOCAL_CONTENT_STORAGE_KEY = "pera-garden-local-content-v1";

export const sectionLabels: Record<BuiltInSectionKey, string> = {
  chrome: "Header & Footer",
  hero: "Hero",
  about: "About",
  services: "Services",
  gallery: "Gallery",
  slider: "Slider",
  location: "Location",
  faq: "FAQ",
  contact: "Contact",
};

export function isBuiltInSectionKey(sectionKey: SectionKey): sectionKey is BuiltInSectionKey {
  return builtInSectionKeys.includes(sectionKey as BuiltInSectionKey);
}

export function isCustomSectionKey(sectionKey: string): sectionKey is SectionKey {
  return customSectionPattern.test(sectionKey);
}

type LocalSectionOverride = {
  draft?: AnySectionContent;
  published?: AnySectionContent;
  orderIndex?: number;
  isVisible?: boolean;
  isDeleted?: boolean;
};

type LocalSectionOverrides = Partial<Record<SectionKey, LocalSectionOverride>>;

function isLocalDev() {
  return Boolean(import.meta.env.DEV && typeof window !== "undefined");
}

function readLocalOverrides(): LocalSectionOverrides {
  if (!isLocalDev()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_CONTENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalSectionOverrides) : {};
  } catch {
    return {};
  }
}

function writeLocalOverride(sectionKey: SectionKey, status: "draft" | "published", content: AnySectionContent) {
  if (!isLocalDev()) {
    return;
  }

  const overrides = readLocalOverrides();
  overrides[sectionKey] = {
    ...(overrides[sectionKey] ?? {}),
    [status]: content,
  };
  window.localStorage.setItem(LOCAL_CONTENT_STORAGE_KEY, JSON.stringify(overrides));
}

function writeLocalSectionState(
  sectionKey: SectionKey,
  patch: Pick<LocalSectionOverride, "orderIndex" | "isVisible" | "isDeleted">,
) {
  if (!isLocalDev()) {
    return;
  }

  const overrides = readLocalOverrides();
  overrides[sectionKey] = {
    ...(overrides[sectionKey] ?? {}),
    ...patch,
  };
  window.localStorage.setItem(LOCAL_CONTENT_STORAGE_KEY, JSON.stringify(overrides));
}

function getLocalOverride(sectionKey: SectionKey, status: "draft" | "published") {
  return readLocalOverrides()[sectionKey]?.[status];
}

function applyLocalRowState(
  row: SiteContentRow,
  status: "draft" | "published",
  localOverrides: LocalSectionOverrides,
): SiteContentRow | null {
  const localState = localOverrides[row.section_key];

  if (localState?.isDeleted) {
    return null;
  }

  const localContent = localState?.[status];

  return {
    ...row,
    order_index: localState?.orderIndex ?? row.order_index,
    is_visible: localState?.isVisible ?? row.is_visible,
    content: localContent ? normalizeSectionContent(row.section_key, localContent) : row.content,
  };
}

function localMissingRows(
  existingRows: SiteContentRow[],
  status: "draft" | "published",
  localOverrides: LocalSectionOverrides,
) {
  return Object.entries(localOverrides)
    .filter(([sectionKey, override]) => sectionKey !== "chrome" && !override?.isDeleted && override?.[status])
    .filter(([sectionKey]) => !existingRows.some((row) => row.section_key === sectionKey))
    .map(([sectionKey, override]) => {
      const row = localOverrideRow(sectionKey as SectionKey, status, override?.[status] as AnySectionContent);
      return {
        ...row,
        order_index: override?.orderIndex ?? row.order_index,
        is_visible: override?.isVisible ?? row.is_visible,
      };
    });
}

function fallbackCustomContent(title = "New section"): CustomContent {
  return {
    tr: {
      eyebrow: "Yeni bölüm",
      title,
      body: "Bu bölüm için içerik yazın.",
      primaryCtaLabel: "Rezervasyon",
      primaryCtaHref: "#contact",
    },
    en: {
      eyebrow: "New section",
      title,
      body: "Write content for this section.",
      primaryCtaLabel: "Book Now",
      primaryCtaHref: "#contact",
    },
  };
}

function fallbackOrderIndex(sectionKey: SectionKey) {
  if (sectionKey === "chrome") {
    return -1;
  }

  return isBuiltInSectionKey(sectionKey) ? orderedSectionKeys.indexOf(sectionKey) : orderedSectionKeys.length;
}

function localOverrideRow(sectionKey: SectionKey, status: "draft" | "published", content: AnySectionContent): SiteContentRow {
  if (isBuiltInSectionKey(sectionKey)) {
    return {
      ...fallbackRow(sectionKey, fallbackOrderIndex(sectionKey), status),
      content: normalizeSectionContent(sectionKey, content),
    };
  }

  return {
    id: `local-${sectionKey}-${status}`,
    section_key: sectionKey,
    status,
    order_index: fallbackOrderIndex(sectionKey),
    is_visible: true,
    default_locale: "tr",
    content: normalizeSectionContent(sectionKey, content),
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

function fallbackForSection(sectionKey: SectionKey): AnySectionContent {
  return isBuiltInSectionKey(sectionKey) ? fallbackContent[sectionKey] : fallbackCustomContent();
}

export function getSectionLabel(sectionKey: SectionKey, content?: AnySectionContent) {
  if (isBuiltInSectionKey(sectionKey)) {
    return sectionLabels[sectionKey];
  }

  const custom = content as Partial<CustomContent> | undefined;
  return custom?.tr?.title || custom?.en?.title || "Custom section";
}

function normalizeChromeContent(content: unknown): ChromeContent {
  const candidate = content as Partial<ChromeContent> | null;
  const normalizeNav = (
    navItems: ChromeContent["tr"]["navItems"] | undefined,
    fallbackNav: ChromeContent["tr"]["navItems"],
  ) => (navItems?.length ? navItems : fallbackNav).map((item) => ({ ...item }));

  return {
    tr: {
      ...fallbackChromeContent.tr,
      ...(candidate?.tr ?? {}),
      logo: {
        ...fallbackChromeContent.tr.logo,
        ...(candidate?.tr?.logo ?? {}),
      },
      navItems: normalizeNav(candidate?.tr?.navItems, fallbackChromeContent.tr.navItems),
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackChromeContent.en,
      ...(candidate?.en ?? {}),
      logo: {
        ...fallbackChromeContent.en.logo,
        ...(candidate?.en?.logo ?? {}),
      },
      navItems: normalizeNav(candidate?.en?.navItems, fallbackChromeContent.en.navItems),
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

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
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackHeroContent.en,
      ...(candidate?.en ?? {}),
      image: {
        ...fallbackHeroContent.en.image,
        ...(candidate?.en?.image ?? {}),
      },
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
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
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackAboutContent.en,
      ...(candidate?.en ?? {}),
      highlights: candidate?.en?.highlights?.length
        ? candidate.en.highlights
        : fallbackAboutContent.en.highlights,
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
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
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackSliderContent.en,
      ...(candidate?.en ?? {}),
      slides: candidate?.en?.slides?.length ? candidate.en.slides : fallbackSliderContent.en.slides,
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

function normalizeServicesContent(content: unknown): ServicesContent {
  const candidate = content as Partial<ServicesContent> | null;
  const normalizeItems = (
    items: ServicesContent["tr"]["items"] | undefined,
    fallbackItems: ServicesContent["tr"]["items"],
  ) =>
    (items?.length ? items : fallbackItems).map((item, index) => ({
      ...fallbackItems[Math.min(index, fallbackItems.length - 1)],
      ...item,
      image: {
        ...fallbackItems[Math.min(index, fallbackItems.length - 1)].image,
        ...(item?.image ?? {}),
      },
      isPublished: item?.isPublished ?? true,
    }));

  return {
    tr: {
      ...fallbackServicesContent.tr,
      ...(candidate?.tr ?? {}),
      items: normalizeItems(candidate?.tr?.items, fallbackServicesContent.tr.items),
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackServicesContent.en,
      ...(candidate?.en ?? {}),
      items: normalizeItems(candidate?.en?.items, fallbackServicesContent.en.items),
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

function normalizeGalleryContent(content: unknown): GalleryContent {
  const candidate = content as Partial<GalleryContent> | null;
  const normalizeItems = (
    items: GalleryContent["tr"]["items"] | undefined,
    fallbackItems: GalleryContent["tr"]["items"],
  ) =>
    (items?.length ? items : fallbackItems).map((item, index) => {
      const fallbackItem = fallbackItems[Math.min(index, fallbackItems.length - 1)];

      return {
        ...fallbackItem,
        ...item,
        id: item?.id || fallbackItem.id || `gallery-${index + 1}`,
        type: item?.type === "video" ? ("video" as const) : ("photo" as const),
        bucket: item?.bucket === "hero" ? ("hero" as const) : ("gallery" as const),
        path: item?.path ?? fallbackItem.path,
        isPublished: item?.isPublished ?? true,
      };
    });

  return {
    tr: {
      ...fallbackGalleryContent.tr,
      ...(candidate?.tr ?? {}),
      items: normalizeItems(candidate?.tr?.items, fallbackGalleryContent.tr.items),
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackGalleryContent.en,
      ...(candidate?.en ?? {}),
      items: normalizeItems(candidate?.en?.items, fallbackGalleryContent.en.items),
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

function normalizeLocationContent(content: unknown): LocationContent {
  const candidate = content as Partial<LocationContent> | null;

  return {
    tr: {
      ...fallbackLocationContent.tr,
      ...(candidate?.tr ?? {}),
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackLocationContent.en,
      ...(candidate?.en ?? {}),
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

function normalizeFaqContent(content: unknown): FaqContent {
  const candidate = content as Partial<FaqContent> | null;

  return {
    tr: {
      ...fallbackFaqContent.tr,
      ...(candidate?.tr ?? {}),
      items: candidate?.tr?.items?.length ? candidate.tr.items : fallbackFaqContent.tr.items,
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackFaqContent.en,
      ...(candidate?.en ?? {}),
      items: candidate?.en?.items?.length ? candidate.en.items : fallbackFaqContent.en.items,
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

function normalizeContactContent(content: unknown): ContactContent {
  const candidate = content as Partial<ContactContent> | null;

  return {
    tr: {
      ...fallbackContactContent.tr,
      ...(candidate?.tr ?? {}),
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallbackContactContent.en,
      ...(candidate?.en ?? {}),
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

function normalizeCustomContent(content: unknown): CustomContent {
  const candidate = content as Partial<CustomContent> | null;
  const fallback = fallbackCustomContent(candidate?.tr?.title || candidate?.en?.title);

  return {
    tr: {
      ...fallback.tr,
      ...(candidate?.tr ?? {}),
      textStyles: normalizeTextStyles(candidate?.tr?.textStyles),
    },
    en: {
      ...fallback.en,
      ...(candidate?.en ?? {}),
      textStyles: normalizeTextStyles(candidate?.en?.textStyles),
    },
  };
}

export function normalizeSectionContent(sectionKey: SectionKey, content: unknown): AnySectionContent {
  if (sectionKey === "chrome") {
    return normalizeChromeContent(content);
  }

  if (sectionKey === "about") {
    return normalizeAboutContent(content);
  }

  if (sectionKey === "slider") {
    return normalizeSliderContent(content);
  }

  if (sectionKey === "services") {
    return normalizeServicesContent(content);
  }

  if (sectionKey === "gallery") {
    return normalizeGalleryContent(content);
  }

  if (sectionKey === "location") {
    return normalizeLocationContent(content);
  }

  if (sectionKey === "faq") {
    return normalizeFaqContent(content);
  }

  if (sectionKey === "contact") {
    return normalizeContactContent(content);
  }

  if (!isBuiltInSectionKey(sectionKey)) {
    return normalizeCustomContent(content);
  }

  return normalizeHeroContent(content);
}

function fallbackRow<TKey extends BuiltInSectionKey>(
  sectionKey: TKey,
  orderIndex: number,
  status: SectionRowStatus = "published",
): SiteContentRow<SectionContentMap[TKey]> {
  return {
    id: `fallback-${sectionKey}-${status}`,
    section_key: sectionKey,
    status,
    order_index: orderIndex,
    is_visible: true,
    default_locale: "tr",
    content: fallbackContent[sectionKey],
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

function normalizeRow(row: SiteContentRow<unknown>): SiteContentRow {
  return {
    ...row,
    is_visible: row.is_visible ?? true,
    content: normalizeSectionContent(row.section_key, row.content),
  };
}

function mergeWithFallbackRows(rows: SiteContentRow[], status: "draft" | "published") {
  const presentSections = new Set(rows.map((row) => row.section_key));
  const missingRows = orderedSectionKeys
    .filter((sectionKey) => !presentSections.has(sectionKey))
    .map((sectionKey, index) => fallbackRow(sectionKey, rows.length + index, status));

  return [...rows, ...missingRows].sort((left, right) => left.order_index - right.order_index);
}

function missingSectionError(sectionKey: SectionKey, action: string) {
  return new Error(
    `The ${getSectionLabel(sectionKey)} section is missing from Supabase. Apply the latest section migration, then try to ${action} again.`,
  );
}

function isMissingSectionWorkflowMigrationError(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null;
  const message = candidate?.message?.toLowerCase() ?? "";

  return (
    candidate?.code === "42703" ||
    candidate?.code === "PGRST204" ||
    candidate?.code === "23514" ||
    message.includes("is_visible") ||
    message.includes("site_content_section_key_check")
  );
}

function sectionWorkflowMigrationError() {
  return new Error(
    "Apply the latest section/gallery migrations before using Hide/Show, Gallery, or custom sections.",
  );
}

function chromeSectionMigrationError() {
  return new Error(
    "Apply the editable Header & Footer migration before saving logo or navigation changes. Run supabase/migrations/20260602124500_add_editable_site_chrome.sql on the target project.",
  );
}

async function insertSectionRow({
  content,
  orderIndex,
  sectionKey,
  status,
  userId,
}: {
  content: AnySectionContent;
  orderIndex: number;
  sectionKey: SectionKey;
  status: SectionRowStatus;
  userId: string | null;
}) {
  const supabase = requireSupabaseClient();
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  const { error } = await supabase.from("site_content").insert({
    section_key: sectionKey,
    status,
    order_index: orderIndex,
    is_visible: sectionKey.startsWith("custom_") ? false : true,
    default_locale: "tr",
    content,
    published_at: publishedAt,
    created_by: userId,
    updated_by: userId,
    published_by: status === "published" ? userId : null,
  });

  if (isMissingSectionWorkflowMigrationError(error)) {
    throw sectionWorkflowMigrationError();
  }

  if (error?.code === "23514") {
    throw missingSectionError(sectionKey, status === "draft" ? "save the draft" : "publish");
  }

  if (error) {
    throw error;
  }
}

export async function getPublishedSections(): Promise<SiteContentRow[]> {
  const localOverrides = readLocalOverrides();

  if (!supabase) {
    return orderedSectionKeys
      .map((sectionKey, index) => {
        const row = fallbackRow(sectionKey, index);
        return applyLocalRowState(row as SiteContentRow, "published", localOverrides);
      })
      .filter((row): row is SiteContentRow => Boolean(row && row.section_key !== "chrome" && row.is_visible));
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("status", "published")
    .order("order_index", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as SiteContentRow<unknown>[])
    .filter((row) => row.section_key !== "chrome")
    .map(normalizeRow)
    .map((row) => applyLocalRowState(row, "published", localOverrides))
    .filter((row): row is SiteContentRow => Boolean(row && row.is_visible));

  const missingOverrideRows = localMissingRows(rows, "published", localOverrides).filter((row) => row.is_visible);

  if (rows.length === 0 && missingOverrideRows.length === 0) {
    return [];
  }

  return [...rows, ...missingOverrideRows].sort((left, right) => left.order_index - right.order_index);
}

export async function getPublishedHero(): Promise<SiteContentRow<HeroContent>> {
  const rows = await getPublishedSections();
  const hero = rows.find((row) => row.section_key === "hero") as SiteContentRow<HeroContent> | undefined;

  return (hero as SiteContentRow<HeroContent> | undefined) ?? fallbackRow("hero", 0);
}

export async function getPublishedChrome(): Promise<SiteContentRow<ChromeContent>> {
  const localContent = getLocalOverride("chrome", "published");

  if (!supabase) {
    const row = fallbackRow("chrome", -1);
    return localContent
      ? ({
          ...row,
          content: normalizeSectionContent("chrome", localContent),
        } as SiteContentRow<ChromeContent>)
      : row;
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("section_key", "chrome")
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const baseRow = data
    ? (normalizeRow(data as SiteContentRow<unknown>) as SiteContentRow<ChromeContent>)
    : fallbackRow("chrome", -1);

  return localContent
    ? ({
        ...baseRow,
        content: normalizeSectionContent("chrome", localContent) as ChromeContent,
      } as SiteContentRow<ChromeContent>)
    : baseRow;
}

export async function getAdminSectionRows() {
  const localOverrides = readLocalOverrides();
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("status", "draft")
    .order("order_index", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as SiteContentRow<unknown>[])
    .filter((row) => row.section_key !== "chrome")
    .map(normalizeRow)
    .map((row) => applyLocalRowState(row, "draft", localOverrides))
    .filter((row): row is SiteContentRow => Boolean(row));

  const rowsWithFallbacks = mergeWithFallbackRows(rows, "draft")
    .map((row) => applyLocalRowState(row, "draft", localOverrides))
    .filter((row): row is SiteContentRow => Boolean(row));
  const missingOverrideRows = localMissingRows(rowsWithFallbacks, "draft", localOverrides);

  return [...rowsWithFallbacks, ...missingOverrideRows].sort((left, right) => left.order_index - right.order_index);
}

export async function getAdminSectionRow<TKey extends SectionKey>(sectionKey: TKey) {
  const localDraft = getLocalOverride(sectionKey, "draft");
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
    if (isBuiltInSectionKey(sectionKey)) {
      const row = fallbackRow(sectionKey, fallbackOrderIndex(sectionKey), "draft") as unknown as SiteContentRow<
        SectionContentMap[TKey & BuiltInSectionKey]
      >;
      return (
        localDraft
          ? {
              ...row,
              content: normalizeSectionContent(sectionKey, localDraft),
            }
          : row
      ) as unknown as SiteContentRow<SectionContentMap[TKey & BuiltInSectionKey]>;
    }

    const row = {
      id: `fallback-${sectionKey}-draft`,
      section_key: sectionKey,
      status: "draft",
      order_index: orderedSectionKeys.length,
      is_visible: false,
      default_locale: "tr",
      content: fallbackCustomContent(),
      published_at: null,
      updated_at: new Date().toISOString(),
    } as SiteContentRow<AnySectionContent>;
    return localDraft
      ? {
          ...row,
          content: normalizeSectionContent(sectionKey, localDraft),
        }
      : row;
  }

  const row = normalizeRow(data as SiteContentRow<unknown>) as SiteContentRow<AnySectionContent>;
  return localDraft
    ? {
        ...row,
        content: normalizeSectionContent(sectionKey, localDraft),
      }
    : row;
}

export async function getAdminHeroRows() {
  const draft = await getAdminSectionRow("hero");

  return {
    draft: draft as SiteContentRow<HeroContent>,
    published: null,
  };
}

export async function saveSectionDraft(sectionKey: SectionKey, content: AnySectionContent) {
  writeLocalOverride(sectionKey, "draft", content);

  try {
    const supabase = requireSupabaseClient();
    const { data: userResult } = await supabase.auth.getUser();
    const updatedBy = userResult.user?.id ?? null;
    const orderIndex = fallbackOrderIndex(sectionKey);

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
      if (isLocalDev()) {
        return;
      }

      if (sectionKey === "chrome" && (error.code === "23514" || error.code === "PGRST204")) {
        throw chromeSectionMigrationError();
      }

      throw error;
    }

    if (!data) {
      await insertSectionRow({
        content,
        orderIndex,
        sectionKey,
        status: "draft",
        userId: updatedBy,
      });
    }
  } catch (error) {
    if (isLocalDev()) {
      return;
    }

    throw error;
  }
}

export async function publishSection(sectionKey: SectionKey, content: AnySectionContent) {
  writeLocalOverride(sectionKey, "published", content);

  try {
    const supabase = requireSupabaseClient();
    const { data: userResult } = await supabase.auth.getUser();
    const publishedBy = userResult.user?.id ?? null;
    const orderIndex = fallbackOrderIndex(sectionKey);

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
      if (isLocalDev()) {
        return;
      }

      if (sectionKey === "chrome" && (error.code === "23514" || error.code === "PGRST204")) {
        throw chromeSectionMigrationError();
      }

      throw error;
    }

    if (!data) {
      await insertSectionRow({
        content,
        orderIndex,
        sectionKey,
        status: "published",
        userId: publishedBy,
      });
    }
  } catch (error) {
    if (isLocalDev()) {
      return;
    }

    throw error;
  }
}

export async function saveHeroDraft(content: HeroContent) {
  await saveSectionDraft("hero", content);
}

export async function publishHero(content: HeroContent) {
  await publishSection("hero", content);
}

export async function saveSectionOrder(sectionKeys: SectionKey[]) {
  sectionKeys.forEach((sectionKey, orderIndex) => {
    writeLocalSectionState(sectionKey, { orderIndex });
  });

  try {
    const supabase = requireSupabaseClient();
    const { data: userResult } = await supabase.auth.getUser();
    const userId = userResult.user?.id ?? null;

    const updates = sectionKeys.flatMap((sectionKey, orderIndex) =>
      (["draft", "published"] as const).map((status) => ({
        orderIndex,
        promise: supabase
          .from("site_content")
          .update({ order_index: orderIndex, updated_by: userId })
          .eq("section_key", sectionKey)
          .eq("status", status)
          .select("id"),
        sectionKey,
        status,
      })),
    );

    const results = await Promise.all(updates.map((update) => update.promise));

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      throw failed.error;
    }

    const missingRows = updates.filter((_update, index) => !results[index].data?.length);

    if (missingRows.length > 0) {
      await Promise.all(
        missingRows.map((row) =>
          insertSectionRow({
            content: fallbackForSection(row.sectionKey),
            orderIndex: row.orderIndex,
            sectionKey: row.sectionKey,
            status: row.status,
            userId,
          }),
        ),
      );
    }
  } catch (error) {
    if (isLocalDev()) {
      return;
    }

    throw error;
  }
}

function slugifySectionTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
}

export async function createCustomSection(title: string) {
  const baseSlug = slugifySectionTitle(title) || "section";
  const suffix = Date.now().toString(36);
  const sectionKey = `custom_${baseSlug}_${suffix}` as SectionKey;
  const content = fallbackCustomContent(title.trim() || "New section");
  const localOverrides = readLocalOverrides();
  const localOrderIndexes = Object.values(localOverrides)
    .map((override) => override?.orderIndex)
    .filter((orderIndex): orderIndex is number => typeof orderIndex === "number");
  const fallbackLocalOrderIndex = Math.max(orderedSectionKeys.length - 1, ...localOrderIndexes) + 1;

  writeLocalOverride(sectionKey, "draft", content);
  writeLocalOverride(sectionKey, "published", content);
  writeLocalSectionState(sectionKey, {
    isDeleted: false,
    isVisible: false,
    orderIndex: fallbackLocalOrderIndex,
  });

  try {
    const supabase = requireSupabaseClient();
    const { data: userResult } = await supabase.auth.getUser();
    const userId = userResult.user?.id ?? null;

    const { data: lastRows, error: orderError } = await supabase
      .from("site_content")
      .select("order_index")
      .eq("status", "draft")
      .order("order_index", { ascending: false })
      .limit(1);

    if (orderError) {
      throw orderError;
    }

    const orderIndex = ((lastRows?.[0]?.order_index as number | undefined) ?? orderedSectionKeys.length - 1) + 1;
    writeLocalSectionState(sectionKey, { orderIndex });
    const now = new Date().toISOString();

    const { error } = await supabase.from("site_content").insert([
      {
        section_key: sectionKey,
        status: "draft",
        order_index: orderIndex,
        is_visible: false,
        default_locale: "tr",
        content,
        created_by: userId,
        updated_by: userId,
      },
      {
        section_key: sectionKey,
        status: "published",
        order_index: orderIndex,
        is_visible: false,
        default_locale: "tr",
        content,
        published_at: now,
        created_by: userId,
        updated_by: userId,
        published_by: userId,
      },
    ]);

    if (error) {
      if (isMissingSectionWorkflowMigrationError(error)) {
        throw sectionWorkflowMigrationError();
      }

      throw error;
    }
  } catch (error) {
    if (isLocalDev()) {
      return sectionKey;
    }

    throw error;
  }

  return sectionKey;
}

export async function saveSectionVisibility(sectionKey: SectionKey, isVisible: boolean) {
  writeLocalSectionState(sectionKey, { isVisible });

  try {
    const supabase = requireSupabaseClient();
    const { data: userResult } = await supabase.auth.getUser();
    const userId = userResult.user?.id ?? null;

    const { error } = await supabase
      .from("site_content")
      .update({ is_visible: isVisible, updated_by: userId })
      .eq("section_key", sectionKey)
      .in("status", ["draft", "published"]);

    if (error) {
      if (isMissingSectionWorkflowMigrationError(error)) {
        throw sectionWorkflowMigrationError();
      }

      throw error;
    }
  } catch (error) {
    if (isLocalDev()) {
      return;
    }

    throw error;
  }
}

export async function deleteCustomSection(sectionKey: SectionKey) {
  if (isBuiltInSectionKey(sectionKey)) {
    throw new Error("Built-in sections cannot be removed. Use Hide to keep one out of the homepage.");
  }

  writeLocalSectionState(sectionKey, { isDeleted: true, isVisible: false });

  try {
    const supabase = requireSupabaseClient();
    const { error, data } = await supabase
      .from("site_content")
      .delete()
      .eq("section_key", sectionKey)
      .in("status", ["draft", "published"])
      .select("id");

    if (error) {
      throw error;
    }

    if (!data?.length) {
      throw new Error("This custom section could not be found.");
    }
  } catch (error) {
    if (isLocalDev()) {
      return;
    }

    throw error;
  }
}

export function getPublicImageUrl(bucket: string, path: string) {
  if (!path) {
    return "";
  }

  if (isLocalMediaPath(path)) {
    return "";
  }

  if (!supabase) {
    return "";
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
