import { useEffect, useState } from "react";
import { About } from "../sections/About";
import { ContactForm } from "../sections/ContactForm";
import { Hero } from "../sections/Hero";
import { Services } from "../sections/Services";
import { Slider } from "../sections/Slider";
import { getPublishedSections } from "../services/supabase/content";
import type {
  AboutContent,
  HeroContent,
  Locale,
  ServicesContent,
  SiteContentRow,
  SliderContent,
} from "../types";

type HomeState = {
  loading: boolean;
  sections: SiteContentRow[];
  error: string;
};

function renderSection(row: SiteContentRow, locale: Locale) {
  if (row.section_key === "about") {
    return <About content={row.content as AboutContent} key={row.id} locale={locale} />;
  }

  if (row.section_key === "slider") {
    return <Slider content={row.content as SliderContent} key={row.id} locale={locale} />;
  }

  if (row.section_key === "services") {
    return <Services content={row.content as ServicesContent} key={row.id} locale={locale} />;
  }

  return <Hero content={row.content as HeroContent} key={row.id} locale={locale} />;
}

export function HomePage() {
  const locale: Locale = "tr";
  const [state, setState] = useState<HomeState>({
    loading: true,
    sections: [],
    error: "",
  });

  useEffect(() => {
    let active = true;

    getPublishedSections()
      .then((sections) => {
        if (active) {
          setState({
            loading: false,
            sections,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            sections: [],
            error: error instanceof Error ? error.message : "Could not load content.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <main className="page-state">Loading Pera Garden...</main>;
  }

  if (state.error || state.sections.length === 0) {
    return <main className="page-state">{state.error}</main>;
  }

  return (
    <main>
      {state.sections.map((section) => renderSection(section, locale))}
      <ContactForm locale={locale} />
      <footer className="site-footer">
        <span>Pera Garden</span>
        <a href="/admin">Admin</a>
      </footer>
    </main>
  );
}
