import { Suspense, lazy, useEffect, useState } from "react";
import { useAdminAccess } from "./hooks/useAdminAccess";
import { useAuth } from "./hooks/useAuth";
import type { SectionKey } from "./types";
import { isCustomSectionKey } from "./services/supabase/content";

type RouteMeta = {
  title: string;
  description: string;
  noIndex?: boolean;
};

const sectionKeys: SectionKey[] = [
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
const HomePage = lazy(() => import("./pages").then((module) => ({ default: module.HomePage })));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then((module) => ({ default: module.AdminLayout })));
const AdminLoginPage = lazy(() =>
  import("./pages/admin/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })),
);
const AdminResetPasswordPage = lazy(() =>
  import("./pages/admin/AdminResetPasswordPage").then((module) => ({ default: module.AdminResetPasswordPage })),
);
const AdminSectionEditorPage = lazy(() =>
  import("./pages/admin/AdminSectionEditorPage").then((module) => ({ default: module.AdminSectionEditorPage })),
);
const AdminSectionsPage = lazy(() =>
  import("./pages/admin/AdminSectionsPage").then((module) => ({ default: module.AdminSectionsPage })),
);
const AdminSubmissionsPage = lazy(() =>
  import("./pages/admin/AdminSubmissionsPage").then((module) => ({ default: module.AdminSubmissionsPage })),
);

const defaultMeta: RouteMeta = {
  title: "Pera Garden | Bahçe düğün ve davet mekânı",
  description: "Pera Garden düğün ve davet organizasyonları için sıcak, zarif ve ulaşımı kolay bir bahçe mekânı.",
};

const adminMeta: RouteMeta = {
  title: "Pera Garden Admin",
  description: "Pera Garden içerik ve rezervasyon yönetimi.",
  noIndex: true,
};

function RouteFallback({ message = "Loading Pera Garden..." }: { message?: string }) {
  return (
    <main className="page-state" aria-live="polite">
      <span>{message}</span>
    </main>
  );
}

function parseSectionKey(pathname: string): SectionKey | null {
  const sectionKey = pathname.split("/").filter(Boolean).at(-1);

  if (sectionKeys.includes(sectionKey as SectionKey) || isCustomSectionKey(sectionKey ?? "")) {
    return sectionKey as SectionKey;
  }

  return null;
}

function getRouteMeta(pathname: string): RouteMeta {
  if (pathname === "/admin/reset") {
    return {
      title: "Şifre sıfırla | Pera Garden Admin",
      description: "Pera Garden admin hesabı için şifre sıfırlama.",
      noIndex: true,
    };
  }

  if (pathname.startsWith("/admin")) {
    return adminMeta;
  }

  return defaultMeta;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  const head = document.head;
  const existing = head.querySelector<HTMLMetaElement>(selector);
  const element = existing ?? document.createElement("meta");

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  if (!existing) {
    head.appendChild(element);
  }
}

function upsertLink(rel: string, href: string) {
  const head = document.head;
  const selector = `link[rel="${rel}"]`;
  const existing = head.querySelector<HTMLLinkElement>(selector);
  const element = existing ?? document.createElement("link");

  element.setAttribute("rel", rel);
  element.setAttribute("href", href);

  if (!existing) {
    head.appendChild(element);
  }
}

function useRouteMeta(pathname: string) {
  useEffect(() => {
    const meta = getRouteMeta(pathname);
    const canonicalUrl = `${window.location.origin}${pathname === "/" ? "/" : pathname}`;

    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: "description", content: meta.description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: meta.description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: meta.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: meta.description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: meta.noIndex ? "noindex, nofollow" : "index, follow",
    });
    upsertLink("canonical", canonicalUrl);
  }, [pathname]);
}

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor || anchor.target || anchor.origin !== window.location.origin) {
        return;
      }

      const nextUrl = new URL(anchor.href);

      if (nextUrl.hash && nextUrl.pathname === window.location.pathname) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      handlePopState();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return pathname;
}

function AdminRoutes({ pathname }: { pathname: string }) {
  const { loading, isAuthenticated } = useAuth();
  const adminAccess = useAdminAccess(isAuthenticated);

  if (loading || adminAccess.loading) {
    return <RouteFallback message="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  if (!adminAccess.isAdmin) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-panel">
          <p className="eyebrow">Pera Garden</p>
          <h1>Admin access required</h1>
          <p>
            This account is signed in, but it has not been promoted in the active admin profile.
          </p>
          {adminAccess.error ? <p className="form-status is-error">{adminAccess.error}</p> : null}
        </section>
      </main>
    );
  }

  let page = <AdminSectionsPage />;

  if (pathname === "/admin/submissions") {
    page = <AdminSubmissionsPage />;
  } else if (pathname === "/admin/hero") {
    page = <AdminSectionEditorPage sectionKey="hero" />;
  } else if (pathname.startsWith("/admin/sections/")) {
    const sectionKey = parseSectionKey(pathname);
    page = sectionKey ? <AdminSectionEditorPage sectionKey={sectionKey} /> : <AdminSectionsPage />;
  }

  return <AdminLayout>{page}</AdminLayout>;
}

export default function App() {
  const pathname = usePathname();
  useRouteMeta(pathname);

  if (pathname === "/admin/reset") {
    return (
      <Suspense fallback={<RouteFallback />}>
        <AdminResetPasswordPage />
      </Suspense>
    );
  }

  if (pathname.startsWith("/admin")) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <AdminRoutes pathname={pathname} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <HomePage />
    </Suspense>
  );
}
