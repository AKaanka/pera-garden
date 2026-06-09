import { Suspense, lazy, useEffect, useState } from "react";
import { useAdminAccess } from "./hooks/useAdminAccess";
import { useAuth } from "./hooks/useAuth";
import type { SectionKey } from "./types";
import { isCustomSectionKey } from "./services/supabase/content";
import {
  adminRouteSeo,
  applyRouteSeo,
  defaultRouteSeo,
  getSiteJsonLd,
  getVenueJsonLd,
  removeJsonLd,
  type RouteSeo,
  upsertJsonLd,
} from "./utils/seo";

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

function getRouteSeo(pathname: string): RouteSeo {
  if (pathname === "/admin/reset") {
    return {
      title: "Şifre sıfırla | Pera Garden Admin",
      description: "Pera Garden admin hesabı için şifre sıfırlama.",
      noIndex: true,
    };
  }

  if (pathname.startsWith("/admin")) {
    return adminRouteSeo;
  }

  return defaultRouteSeo;
}

function useRouteSeo(pathname: string) {
  useEffect(() => {
    const seo = getRouteSeo(pathname);

    applyRouteSeo(pathname, seo);

    if (seo.noIndex) {
      removeJsonLd("site");
      removeJsonLd("venue");
      return;
    }

    upsertJsonLd("site", getSiteJsonLd());
    upsertJsonLd("venue", getVenueJsonLd());
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
  useRouteSeo(pathname);

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
