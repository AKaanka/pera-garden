import type { HeroContent, Locale } from "../types";
import { getPublicImageUrl } from "../services/supabase/content";
import { getTextStyle } from "../utils/textStyles";

type HeroProps = {
  content: HeroContent;
  locale: Locale;
};

export function Hero({ content, locale }: HeroProps) {
  const hero = content[locale] ?? content.tr;
  const imageUrl = getPublicImageUrl(hero.image.bucket, hero.image.path);

  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden={!imageUrl}>
        {imageUrl ? <img src={imageUrl} alt={hero.image.alt} /> : <div className="hero-media-fallback" />}
      </div>
      <div className="hero-content">
        <p className="eyebrow" style={getTextStyle(hero, "eyebrow")}>{hero.eyebrow}</p>
        <h1 id="hero-title" style={getTextStyle(hero, "title")}>{hero.title}</h1>
        <p className="hero-subtitle" style={getTextStyle(hero, "subtitle")}>{hero.subtitle}</p>
        <div className="hero-actions">
          <a className="primary-action" href={hero.primaryCtaHref} style={getTextStyle(hero, "primaryCtaLabel")}>
            {hero.primaryCtaLabel}
          </a>
          <a className="hero-secondary-action" href={hero.secondaryCtaHref} style={getTextStyle(hero, "secondaryCtaLabel")}>
            {hero.secondaryCtaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
