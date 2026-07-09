"use client";

import { useState } from "react";

interface Props {
  planoKey: string;
  label: string;
  destaque?: boolean;
}

export default function AssinarButton({ planoKey, label, destaque }: Props) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleAssinar() {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/mp/assinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoKey }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.open(data.init_point, "_blank");
      } else {
        setErro(`Erro: ${data.detail ?? data.error ?? JSON.stringify(data)}`);
        setLoading(false);
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleAssinar}
        disabled={loading}
        style={{
          width: "100%", height: 44, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "var(--radius-pill)", border: destaque ? "none" : "1px solid var(--color-brand-primary)",
          background: loading ? "var(--neutral-200)" : destaque ? "var(--color-brand-primary)" : "transparent",
          color: loading ? "var(--text-tertiary)" : destaque ? "#fff" : "var(--color-brand-primary)",
          fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-body)",
        }}
      >
        {loading ? "Redirecionando…" : label}
      </button>
      {erro && <p style={{ fontSize: 12, color: "var(--color-danger-fg)", marginTop: 6, textAlign: "center" }}>{erro}</p>}
    </div>
  );
}
