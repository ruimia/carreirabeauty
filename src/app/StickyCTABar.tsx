"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StickyCTABar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        .sticky-cta-bar { display: none; }
        @media (max-width: 768px) {
          .sticky-cta-bar { display: ${visible ? "flex" : "none"}; }
        }
      `}</style>
      <div
        className="sticky-cta-bar"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
          gap: 10, padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
          background: "var(--surface-card)", borderTop: "1px solid var(--border-default)",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <Link href="/onboarding/profissional" prefetch={false} style={{
          flex: 1, height: 46, borderRadius: "var(--radius-pill)", border: "none",
          background: "var(--brand-cyan-500)", color: "#fff", fontFamily: "var(--font-body)",
          fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, textDecoration: "none", whiteSpace: "nowrap",
        }}>
          👤 Sou profissional
        </Link>
        <Link href="/onboarding/empresa" prefetch={false} style={{
          flex: 1, height: 46, borderRadius: "var(--radius-pill)", border: "none",
          background: "var(--color-brand-primary)", color: "#fff", fontFamily: "var(--font-body)",
          fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, textDecoration: "none", whiteSpace: "nowrap",
        }}>
          🏪 Sou empresa
        </Link>
      </div>
    </>
  );
}
