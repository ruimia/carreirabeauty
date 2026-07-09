"use client";

import { useState } from "react";
import { encerrarVaga, reabrirVaga } from "./actions";

interface Props {
  jobId: string;
  fechada: boolean;
}

export default function EncerrarVagaButton({ jobId, fechada }: Props) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    if (fechada) await reabrirVaga(jobId);
    else await encerrarVaga(jobId);
    setLoading(false);
  }

  if (fechada) {
    return (
      <button onClick={handle} disabled={loading} style={{
        fontSize: 13, fontWeight: 600, color: "var(--color-brand-primary)",
        background: "none", border: "none", cursor: "pointer", padding: 0,
        opacity: loading ? 0.5 : 1,
      }}>
        {loading ? "…" : "Reabrir →"}
      </button>
    );
  }

  return (
    <button onClick={handle} disabled={loading} style={{
      fontSize: 13, fontWeight: 500, color: "var(--text-tertiary)",
      background: "none", border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-pill)", padding: "4px 12px",
      cursor: "pointer", opacity: loading ? 0.5 : 1,
    }}>
      {loading ? "…" : "Encerrar"}
    </button>
  );
}
