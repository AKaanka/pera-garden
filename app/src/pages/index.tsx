import { useEffect, useState } from "react";
import { About } from "../sections/About";
import { ContactForm } from "../sections/ContactForm";
import { Hero } from "../sections/Hero";
import { getPublishedHero } from "../services/supabase/content";
import type { HeroContent, Locale } from "../types";

type HomeState = {
  loading: boolean;
  content: HeroContent | null;
  error: string;
};

export function HomePage() {
  const locale: Locale = "tr";
  const [state, setState] = useState<HomeState>({
    loading: true,
    content: null,
    error: "",
  });

  useEffect(() => {
    let active = true;

    getPublishedHero()
      .then((row) => {
        if (active) {
          setState({
            loading: false,
            content: row.content,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            content: null,
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

  if (state.error || !state.content) {
    return <main className="page-state">{state.error}</main>;
  }

  return (
    <main>
      <Hero content={state.content} locale={locale} />
      <About />
      <ContactForm locale={locale} />
      <footer className="site-footer">
        <span>Pera Garden</span>
        <a href="/admin">Admin</a>
      </footer>
    </main>
  );
}
