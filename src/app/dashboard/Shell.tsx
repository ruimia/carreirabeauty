"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Tab {
  label: string;
  icon: string;
  href: string;
  cta?: boolean;
  isActive: (pathname: string) => boolean;
}

interface Props {
  children: React.ReactNode;
  role: "empresa" | "profissional";
  userName: string;
  subtitle?: string;
  logoUrl?: string;
}

const EMPRESA_TABS: Tab[] = [
  {
    label: "Vagas",
    icon: "📋",
    href: "/dashboard/empresa",
    isActive: (p) =>
      p === "/dashboard/empresa" ||
      (p.startsWith("/dashboard/empresa/vagas/") && !p.includes("/nova")),
  },
  {
    label: "Nova vaga",
    icon: "➕",
    href: "/dashboard/empresa/vagas/nova",
    cta: true,
    isActive: (p) => p.startsWith("/dashboard/empresa/vagas/nova"),
  },
  {
    label: "Planos",
    icon: "⭐",
    href: "/dashboard/empresa/planos",
    isActive: (p) => p.startsWith("/dashboard/empresa/planos"),
  },
  {
    label: "Perfil",
    icon: "👤",
    href: "/dashboard/empresa/perfil",
    isActive: (p) => p.startsWith("/dashboard/empresa/perfil"),
  },
];

const PROFISSIONAL_TABS: Tab[] = [
  {
    label: "Vagas",
    icon: "🔍",
    href: "/dashboard/profissional",
    isActive: (p) => p === "/dashboard/profissional",
  },
  {
    label: "Planos",
    icon: "⭐",
    href: "/dashboard/profissional/planos",
    isActive: (p) => p.startsWith("/dashboard/profissional/planos"),
  },
  {
    label: "Perfil",
    icon: "👤",
    href: "/dashboard/profissional/perfil",
    isActive: (p) => p.startsWith("/dashboard/profissional/perfil"),
  },
];

export default function Shell({ children, role, userName, subtitle, logoUrl }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = role === "empresa" ? EMPRESA_TABS : PROFISSIONAL_TABS;
  const dashboardHref = role === "empresa" ? "/dashboard/empresa" : "/dashboard/profissional";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <style>{`
        .ds-shell { display: flex; min-height: 100vh; background: var(--surface-page); }
        .ds-sidebar {
          display: none;
          width: 220px;
          flex-shrink: 0;
          position: fixed;
          left: 0; top: 0;
          height: 100vh;
          background: var(--surface-card);
          border-right: 1px solid var(--border-default);
          flex-direction: column;
          z-index: 20;
        }
        .ds-main { flex: 1; display: flex; flex-direction: column; }
        .ds-content { flex: 1; padding-bottom: 72px; }
        .ds-bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 64px;
          background: var(--surface-card);
          border-top: 1px solid var(--border-default);
          display: flex;
          align-items: stretch;
          z-index: 20;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .ds-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.15s;
        }
        .ds-tab:active { opacity: 0.7; }
        .ds-tab-icon { font-size: 20px; line-height: 1; }
        .ds-tab-label { font-size: 10px; font-weight: 600; font-family: var(--font-body); letter-spacing: 0.02em; }
        .ds-tab-cta .ds-tab-icon {
          width: 44px; height: 44px;
          background: var(--color-brand-primary);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 2px 8px rgba(220,0,220,0.35);
          margin-top: -8px;
        }
        .ds-tab-cta .ds-tab-label { color: var(--color-brand-primary); }
        @media (min-width: 768px) {
          .ds-sidebar { display: flex; }
          .ds-main { margin-left: 220px; }
          .ds-content { padding-bottom: 0; }
          .ds-bottom-nav { display: none; }
          .ds-mobile-only { display: none !important; }
        }
      `}</style>

      <div className="ds-shell">
        {/* Sidebar (desktop) */}
        <aside className="ds-sidebar">
          <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border-default)" }}>
            <Link href={dashboardHref} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/logo-square.jpg" alt="CarreiraBeauty" style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                  {userName}
                </p>
                {subtitle && (
                  <p style={{ fontSize: 11, color: "var(--color-brand-primary)", fontWeight: 600 }}>{subtitle}</p>
                )}
              </div>
            </Link>
          </div>

          <nav style={{ flex: 1, padding: "12px 12px" }}>
            {tabs.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 12px",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    marginBottom: 2,
                    background: active ? "var(--brand-blush-50, #fdf4ff)" : "transparent",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{tab.icon}</span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--color-brand-primary)" : "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border-default)" }}>
            <a
              href="https://wa.me/5511987049210?text=Ol%C3%A1%2C+preciso+de+suporte+no+CarreiraBeauty"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: "var(--radius-md)",
                textDecoration: "none", color: "#25D366",
                fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
              }}
            >
              <span style={{ fontSize: 18 }}>💬</span>
              Suporte
            </a>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: "var(--radius-md)",
                border: "none", background: "transparent", cursor: "pointer",
                color: "var(--text-tertiary)", fontSize: 14, fontWeight: 500,
                fontFamily: "var(--font-body)",
              }}
            >
              <span style={{ fontSize: 18 }}>🚪</span>
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="ds-main">
          <div className="ds-content">
            {children}
          </div>

          {/* Bottom tabs (mobile) */}
          <nav className="ds-bottom-nav">
            {tabs.map((tab) => {
              const active = tab.isActive(pathname);
              const color = active
                ? "var(--color-brand-primary)"
                : "var(--text-tertiary)";

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`ds-tab${tab.cta ? " ds-tab-cta" : ""}`}
                >
                  {tab.cta ? (
                    <span className="ds-tab-icon">➕</span>
                  ) : (
                    <span className="ds-tab-icon" style={{ filter: active ? "none" : "grayscale(1) opacity(0.5)" }}>
                      {tab.icon}
                    </span>
                  )}
                  <span className="ds-tab-label" style={{ color: tab.cta ? "var(--color-brand-primary)" : color }}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
