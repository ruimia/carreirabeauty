"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rodarAtualizacaoAdzuna } from "./actions";

interface Resultado {
  cidadesProcessadas: number;
  chamadasApi: number;
  vagasEncontradas: number;
  erros: string[];
  bairrosReforcados: number;
  vagasReforco: number;
}

export default function AtualizarCacheButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function handleClick() {
    setLoading(true);
    setResultado(null);
    try {
      const stats = await rodarAtualizacaoAdzuna();
      setResultado(stats);
      router.refresh(); // atualiza "Última execução registrada" e o total no cache
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
      >
        {loading ? "Atualizando… (leva alguns segundos)" : "Atualizar cache da Adzuna agora"}
      </button>

      {resultado && (
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>{resultado.cidadesProcessadas}</strong> cidade(s) processada(s), <strong>{resultado.chamadasApi}</strong> chamada(s) à API</p>
          <p><strong>{resultado.vagasEncontradas}</strong> vaga(s) de beleza encontrada(s) e salva(s)</p>
          <p><strong>{resultado.vagasReforco}</strong> vaga(s) de reforço (busca por bairro) em <strong>{resultado.bairrosReforcados}</strong> bairro(s) com pouca cobertura</p>
          {resultado.erros.length > 0 && (
            <div className="text-rose-600">
              <p className="font-semibold">{resultado.erros.length} erro(s):</p>
              <ul className="list-disc list-inside">
                {resultado.erros.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
