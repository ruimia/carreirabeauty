"use client";

import { useState } from "react";
import { moderarDepoimento } from "./actions";

export default function ModerarBotoes({ depoimentoId }: { depoimentoId: string }) {
  const [loading, setLoading] = useState<"aprovado" | "rejeitado" | null>(null);

  async function handle(status: "aprovado" | "rejeitado") {
    setLoading(status);
    await moderarDepoimento(depoimentoId, status);
    setLoading(null);
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => handle("rejeitado")} disabled={loading !== null} style={{
        flex: 1, height: 40, borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)",
        background: "transparent", color: "var(--text-secondary)", fontFamily: "var(--font-body)",
        fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: loading ? 0.6 : 1,
      }}>
        {loading === "rejeitado" ? "Rejeitando…" : "Rejeitar"}
      </button>
      <button onClick={() => handle("aprovado")} disabled={loading !== null} style={{
        flex: 1, height: 40, borderRadius: "var(--radius-pill)", border: "none",
        background: "var(--color-brand-primary)", color: "#fff", fontFamily: "var(--font-body)",
        fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: loading ? 0.6 : 1,
      }}>
        {loading === "aprovado" ? "Aprovando…" : "Aprovar e publicar"}
      </button>
    </div>
  );
}
