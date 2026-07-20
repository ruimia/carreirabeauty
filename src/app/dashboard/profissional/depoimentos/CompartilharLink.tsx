"use client";

import { useState } from "react";

export default function CompartilharLink({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/depoimento/${slug}` : "";

  async function handleCopiar() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function handleCompartilhar() {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Deixe um depoimento pra mim", url });
      } catch {
        // usuário cancelou o share nativo — sem ação necessária
      }
    } else {
      handleCopiar();
    }
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--brand-magenta-50), var(--surface-card))",
      borderRadius: "var(--radius-xl)", border: "1px solid var(--brand-magenta-100)",
      boxShadow: "var(--shadow-xs)", padding: 18,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <i className="ph-fill ph-chat-centered-text" style={{ fontSize: 18, color: "var(--color-brand-primary)" }}></i>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
          Peça um depoimento
        </p>
      </div>
      <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        Manda esse link pra quem você já atendeu. É rápido, sem precisar criar conta.
      </p>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, background: "var(--surface-card)",
        border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "10px 12px",
      }}>
        <p style={{
          flex: 1, minWidth: 0, fontSize: 13.5, color: "var(--text-link)", fontFamily: "var(--font-body)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          carreirabeauty.com/depoimento/{slug}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleCopiar} style={{
          flex: 1, height: 42, borderRadius: "var(--radius-pill)", border: "1px solid var(--color-brand-primary)",
          background: "transparent", color: "var(--color-brand-primary)", fontFamily: "var(--font-body)",
          fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 6,
        }}>
          <i className={copiado ? "ph-fill ph-check" : "ph ph-copy"}></i>
          {copiado ? "Copiado!" : "Copiar link"}
        </button>
        <button onClick={handleCompartilhar} style={{
          flex: 1, height: 42, borderRadius: "var(--radius-pill)", border: "none",
          background: "var(--color-brand-primary)", color: "#fff", fontFamily: "var(--font-body)",
          fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 6,
        }}>
          <i className="ph ph-share-network"></i>
          Compartilhar
        </button>
      </div>
    </div>
  );
}
