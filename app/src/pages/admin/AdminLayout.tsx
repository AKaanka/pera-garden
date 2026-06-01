import type { ReactNode } from "react";
import { signOut } from "../../services/supabase/auth";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const handleSignOut = async () => {
    await signOut();
    window.history.pushState({}, "", "/admin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          Pera Garden
        </a>
        <nav aria-label="Admin">
          <a href="/admin/sections">Sections</a>
          <a href="/admin/sections/hero">Hero</a>
          <a href="/admin/submissions">Submissions</a>
        </nav>
        <button className="secondary-button" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}
