import { useEffect, useState } from "react";
import { getPublicImageUrl } from "../services/supabase/content";
import { isLocalMediaPath, resolveLocalMediaUrl } from "../services/supabase/localMedia";
import type { GalleryContent, Locale } from "../types";
import { getTextStyle } from "../utils/textStyles";

type GalleryProps = {
  content: GalleryContent;
  locale: Locale;
};

const galleryLabels: Record<Locale, { photos: string; typeLabel: string; videos: string }> = {
  tr: {
    photos: "Fotoğraflar",
    typeLabel: "Galeri türü",
    videos: "Videolar",
  },
  en: {
    photos: "Photos",
    typeLabel: "Gallery type",
    videos: "Videos",
  },
};

function useGalleryMediaUrl(bucket: string, path: string) {
  const [mediaUrl, setMediaUrl] = useState(() => (isLocalMediaPath(path) ? "" : getPublicImageUrl(bucket, path)));

  useEffect(() => {
    let active = true;

    if (!path) {
      setMediaUrl("");
      return () => {
        active = false;
      };
    }

    if (!isLocalMediaPath(path)) {
      setMediaUrl(getPublicImageUrl(bucket, path));
      return () => {
        active = false;
      };
    }

    void resolveLocalMediaUrl(path).then((url) => {
      if (active) {
        setMediaUrl(url);
      }
    });

    return () => {
      active = false;
    };
  }, [bucket, path]);

  return mediaUrl;
}

function GalleryMedia({
  alt,
  bucket,
  path,
  type,
}: {
  alt: string;
  bucket: string;
  path: string;
  type: "photo" | "video";
}) {
  const mediaUrl = useGalleryMediaUrl(bucket, path);

  if (!mediaUrl) {
    return null;
  }

  return type === "video" ? (
    <video muted playsInline preload="metadata" src={mediaUrl} />
  ) : (
    <img src={mediaUrl} alt={alt} loading="lazy" />
  );
}

function GalleryLightboxMedia({
  alt,
  bucket,
  path,
  type,
}: {
  alt: string;
  bucket: string;
  path: string;
  type: "photo" | "video";
}) {
  const mediaUrl = useGalleryMediaUrl(bucket, path);

  if (!mediaUrl) {
    return null;
  }

  return type === "video" ? (
    <video controls autoPlay playsInline preload="metadata" src={mediaUrl}>
      Video playback is not supported in this browser.
    </video>
  ) : (
    <img src={mediaUrl} alt={alt} />
  );
}

export function Gallery({ content, locale }: GalleryProps) {
  const gallery = content[locale] ?? content.tr;
  const labels = galleryLabels[locale];
  const visibleItems = gallery.items.filter((item) => item.isPublished && item.path.trim());
  const photoItems = visibleItems.filter((item) => item.type === "photo");
  const videoItems = visibleItems.filter((item) => item.type === "video");
  const [activeType, setActiveType] = useState<"photo" | "video">(photoItems.length > 0 ? "photo" : "video");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeItems = activeType === "photo" ? photoItems : videoItems;
  const activeItemIndex = visibleItems.findIndex((item) => item.id === activeItemId);
  const activeItem = activeItemIndex >= 0 ? visibleItems[activeItemIndex] : null;

  const showRelativeItem = (direction: -1 | 1) => {
    if (visibleItems.length < 2 || activeItemIndex < 0) {
      return;
    }

    const nextIndex = (activeItemIndex + direction + visibleItems.length) % visibleItems.length;
    const nextItem = visibleItems[nextIndex];
    setActiveType(nextItem.type);
    setActiveItemId(nextItem.id);
  };

  const handleTouchEnd = (touchEndX: number) => {
    if (touchStartX === null) {
      return;
    }

    const distance = touchEndX - touchStartX;
    const minimumSwipeDistance = 40;

    if (Math.abs(distance) >= minimumSwipeDistance) {
      showRelativeItem(distance > 0 ? -1 : 1);
    }

    setTouchStartX(null);
  };

  useEffect(() => {
    if (!activeItemId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItemId(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        showRelativeItem(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        showRelativeItem(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItemId, activeItemIndex, activeItems]);

  useEffect(() => {
    if (activeType === "photo" && photoItems.length === 0 && videoItems.length > 0) {
      setActiveType("video");
      return;
    }

    if (activeType === "video" && videoItems.length === 0 && photoItems.length > 0) {
      setActiveType("photo");
    }
  }, [activeType, photoItems.length, videoItems.length]);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <>
      <section className="gallery-section" id="gallery" aria-labelledby="gallery-title">
        <div className="section-shell gallery-shell">
          <div className="gallery-heading">
            <p className="eyebrow" style={getTextStyle(gallery, "eyebrow")}>{gallery.eyebrow}</p>
            <h2 id="gallery-title" style={getTextStyle(gallery, "title")}>{gallery.title}</h2>
            <p style={getTextStyle(gallery, "subtitle")}>{gallery.subtitle}</p>
          </div>

          <div className="gallery-type-switcher" role="tablist" aria-label={labels.typeLabel}>
            <button
              aria-selected={activeType === "photo"}
              className={activeType === "photo" ? "is-active" : ""}
              disabled={photoItems.length === 0}
              role="tab"
              type="button"
              onClick={() => {
                setActiveItemId(null);
                setActiveType("photo");
              }}
            >
              {labels.photos}
            </button>
            <button
              aria-selected={activeType === "video"}
              className={activeType === "video" ? "is-active" : ""}
              disabled={videoItems.length === 0}
              role="tab"
              type="button"
              onClick={() => {
                setActiveItemId(null);
                setActiveType("video");
              }}
            >
              {labels.videos}
            </button>
          </div>

          <div className="gallery-grid">
            {activeItems.map((item, index) => {
              return (
                <article className="gallery-item" key={item.id}>
                  <button
                    className="gallery-media-button"
                    type="button"
                    onClick={() => setActiveItemId(item.id)}
                    aria-label={`${item.type === "video" ? "Open video" : "Open photo"}: ${item.title}`}
                  >
                    <div className="gallery-media">
                      <GalleryMedia alt={item.alt} bucket={item.bucket} path={item.path} type={item.type} />
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {activeItem ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={() => setActiveItemId(null)}
        >
          <div className="gallery-lightbox-panel is-media-only" onClick={(event) => event.stopPropagation()}>
            <div className="gallery-lightbox-toolbar">
              <div />
              <button className="gallery-lightbox-close" type="button" onClick={() => setActiveItemId(null)}>
                Close
              </button>
            </div>
            <div
              className="gallery-lightbox-stage"
              onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
              onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
            >
              {visibleItems.length > 1 ? (
                <button
                  aria-label="Previous media"
                  className="gallery-lightbox-arrow is-left"
                  type="button"
                  onClick={() => showRelativeItem(-1)}
                >
                  ‹
                </button>
              ) : null}

              <div className="gallery-lightbox-media">
                <GalleryLightboxMedia
                  alt={activeItem.alt}
                  bucket={activeItem.bucket}
                  path={activeItem.path}
                  type={activeItem.type}
                />
              </div>

              {visibleItems.length > 1 ? (
                <button
                  aria-label="Next media"
                  className="gallery-lightbox-arrow is-right"
                  type="button"
                  onClick={() => showRelativeItem(1)}
                >
                  ›
                </button>
              ) : null}

              {visibleItems.length > 1 ? (
                <div className="gallery-lightbox-dots" aria-label="Gallery position">
                  {visibleItems.map((item, index) => (
                    <button
                      aria-label={`Show ${item.type === "video" ? "video" : "photo"} ${index + 1} of ${visibleItems.length}`}
                      aria-current={item.id === activeItem.id ? "true" : undefined}
                      className={item.id === activeItem.id ? "is-active" : ""}
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveType(item.type);
                        setActiveItemId(item.id);
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
