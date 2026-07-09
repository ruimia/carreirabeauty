"use client";

import { useState } from "react";
import { aprovarVaga, rejeitarVaga } from "../actions";

export default function ModeracaoActions({ id }: { id: string }) {
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAprovar() {
    setLoading(true);
    await aprovarVaga(id);
  }

  async function handleRejeitar() {
    if (!motivo.trim()) return;
    setLoading(true);
    await rejeitarVaga(id, motivo.trim());
  }

  if (rejeitando) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        <textarea
          rows={2}
          placeholder="Motivo da rejeição (será visto pela empresa)…"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        <div className="flex gap-2">
          <button onClick={() => setRejeitando(false)}
            className="text-xs text-gray-400 hover:text-gray-600">
            Cancelar
          </button>
          <button onClick={handleRejeitar} disabled={!motivo.trim() || loading}
            className="text-xs bg-rose-500 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40">
            {loading ? "Salvando…" : "Confirmar rejeição"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button onClick={handleAprovar} disabled={loading}
        className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-40">
        {loading ? "…" : "✓ Aprovar"}
      </button>
      <button onClick={() => setRejeitando(true)} disabled={loading}
        className="text-xs border border-rose-300 text-rose-500 px-3 py-1.5 rounded-lg font-semibold hover:bg-rose-50">
        ✕ Rejeitar
      </button>
    </div>
  );
}
