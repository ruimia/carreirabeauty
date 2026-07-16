"use client";

import { useState } from "react";
import { contarCandidatosVaga, dispararEmailCandidatos } from "../actions";

export default function DispararEmailButton({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [resultado, setResultado] = useState<{ enviados: number; semEmail: number; total: number } | null>(null);

  async function handleAbrir() {
    setAberto(true);
    setResultado(null);
    setLoading(true);
    const { total } = await contarCandidatosVaga(id);
    setTotal(total);
    setLoading(false);
  }

  async function handleDisparar() {
    setLoading(true);
    const r = await dispararEmailCandidatos(id);
    setResultado(r);
    setLoading(false);
  }

  if (!aberto) {
    return (
      <button onClick={handleAbrir}
        className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 mt-2">
        📧 Enviar email pros candidatos
      </button>
    );
  }

  return (
    <div className="mt-2 bg-blue-50 rounded-lg p-3 text-sm">
      {loading && total === null && <p className="text-gray-500">Buscando candidatos…</p>}

      {total !== null && !resultado && (
        <>
          <p className="text-gray-700 mb-2">
            <strong>{total}</strong> candidato{total !== 1 ? "s" : ""} na mesma cidade e função (sem filtro por raio ainda).
          </p>
          <div className="flex gap-2">
            <button onClick={() => setAberto(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Cancelar
            </button>
            <button onClick={handleDisparar} disabled={loading || total === 0}
              className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40">
              {loading ? "Enviando…" : `Confirmar envio pra ${total}`}
            </button>
          </div>
        </>
      )}

      {resultado && (
        <p className="text-gray-700">
          ✓ {resultado.enviados} email(s) enviado(s)
          {resultado.semEmail > 0 && `, ${resultado.semEmail} sem email cadastrado`}.
        </p>
      )}
    </div>
  );
}
