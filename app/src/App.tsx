import { useEffect, useState } from "react";
import { HomePage } from "./pages";
import { AdminHeroPage } from "./pages/admin/AdminHeroPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminSubmissionsPage } from "./pages/admin/AdminSubmissionsPage";
import { useAdminAccess } from "./hooks/useAdminAccess";
import { useAuth } from "./hooks/useAuth";

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

  return (
    <AdminLayout>
      {pathname === "/admin/submissions" ? <AdminSubmissionsPage /> : <AdminHeroPage />}
    </AdminLayout>
  );
}

export default function App() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <AdminRoutes pathname={pathname} />;
  }

  return <HomePage />;
}
