import type { HeroContent, Locale } from "../types";
import { getPublicImageUrl } from "../services/supabase/content";

type HeroProps = {
  content: HeroContent;
  locale: Locale;
};

export function Hero({ content, locale }: HeroProps) {
  const hero = content[locale] ?? content.tr;
  const imageUrl = getPublicImageUrl(hero.image.bucket, hero.image.path);

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden={!imageUrl}>
        {imageUrl ? <img src={imageUrl} alt={hero.image.alt} /> : <div className="hero-media-fallback" />}
      </div>
      <div className="hero-content">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title">{hero.title}</h1>
        <p className="hero-subtitle">{hero.subtitle}</p>
        <a className="primary-action" href={hero.primaryCtaHref}>
          {hero.primaryCtaLabel}
        </a>
      </div>
    </section>
  );
}
