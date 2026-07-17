"use client";

import { useEffect, useState } from "react";

export default function CandidatarFloatingButton({ jaAplicou }: { jaAplicou: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (jaAplicou) return;
    const alvo = document.getElementById("candidatura-section");
    if (!alvo) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(alvo);
    return () => observer.disconnect();
  }, [jaAplicou]);

  if (jaAplicou) return null;

  function handleClick() {
    document.getElementById("candidatura-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <style>{`
        .candidatar-floating { display: none; }
        @media (max-width: 768px) {
          .candidatar-floating { display: ${visible ? "flex" : "none"}; }
        }
      `}</style>
      <button
        onClick={handleClick}
        className="candidatar-floating"
        style={{
          position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 30,
          height: 52, borderRadius: "var(--radius-pill)", border: "none",
          background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
          alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 6px 20px rgba(220,0,220,0.35)", cursor: "pointer",
        }}
      >
        Quero me candidatar ↓
      </button>
    </>
  );
}
