import { useEffect, useState } from "react";
import { HomePage } from "./pages";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminSectionEditorPage } from "./pages/admin/AdminSectionEditorPage";
import { AdminSectionsPage } from "./pages/admin/AdminSectionsPage";
import { AdminSubmissionsPage } from "./pages/admin/AdminSubmissionsPage";
import { useAdminAccess } from "./hooks/useAdminAccess";
import { useAuth } from "./hooks/useAuth";
import type { SectionKey } from "./types";

const sectionKeys: SectionKey[] = ["hero", "about", "services", "slider"];

function parseSectionKey(pathname: string): SectionKey | null {
  const sectionKey = pathname.split("/").filter(Boolean).at(-1);

  return sectionKeys.includes(sectionKey as SectionKey) ? (sectionKey as SectionKey) : null;
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
    return <main className="page-state">Checking session...</main>;
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

  if (pathname.startsWith("/admin")) {
    return <AdminRoutes pathname={pathname} />;
  }

  return <HomePage />;
}
