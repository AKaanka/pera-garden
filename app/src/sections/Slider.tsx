import { useState } from "react";
import type { Locale, SliderContent } from "../types";

type SliderProps = {
  content: SliderContent;
  locale: Locale;
};

export function Slider({ content, locale }: SliderProps) {
  const slider = content[locale] ?? content.tr;
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = slider.slides.length > 0 ? slider.slides : content.tr.slides;
  const activeSlide = slides[Math.min(activeIndex, slides.length - 1)];

  if (!activeSlide) {
    return null;
  }

  return (
    <section className="slider-section" aria-labelledby="slider-title">
      <div className="section-shell slider-shell">
        <div className="slider-heading">
          <p className="eyebrow">{slider.eyebrow}</p>
          <h2 id="slider-title">{slider.title}</h2>
          <p>{slider.subtitle}</p>
        </div>

        <div className="slider-panel">
          <p className="slider-count">
            {activeIndex + 1} / {slides.length}
          </p>
          <h3>{activeSlide.title}</h3>
          <p>{activeSlide.description}</p>
          <div className="slider-controls" aria-label="Slider">
            {slides.map((slide, index) => (
              <button
                aria-label={`${slide.title} slaytını göster`}
                aria-pressed={activeIndex === index}
                className={activeIndex === index ? "is-active" : ""}
                key={`${slide.title}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
