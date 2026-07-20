"use client";

import { useState } from "react";
import VagaExternaCard from "./VagaExternaCard";

interface VagaExternaComData {
  id: string;
  titulo: string;
  empresa: string | null;
  cidade: string | null;
  estado: string | null;
  url: string;
  salario_min: number | null;
  salario_max: number | null;
  descricao?: string | null;
  publicado_em?: string | null;
  // calculado no servidor pra não divergir entre server render e hidratação
  publicadoRelativo: string | null;
}

export default function VagasExternasLista({ vagas, professionalId, maxVisivel = 3 }: {
  vagas: VagaExternaComData[];
  professionalId: string;
  maxVisivel?: number;
}) {
  const [expandido, setExpandido] = useState(false);

  const podeColapsar = vagas.length > maxVisivel;
  const visiveis = podeColapsar && !expandido ? vagas.slice(0, maxVisivel) : vagas;
  const ocultos = podeColapsar ? vagas.length - maxVisivel : 0;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visiveis.map((v) => (
          <VagaExternaCard key={v.id} vaga={v} professionalId={professionalId} publicadoRelativo={v.publicadoRelativo} />
        ))}
      </div>

      {podeColapsar && (
        <button
          onClick={() => setExpandido((x) => !x)}
          style={{
            width: "100%", marginTop: 12, height: 44, cursor: "pointer",
            borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)",
            background: "var(--surface-card)",
            font: "700 13px/1 var(--font-body)", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {expandido ? "Ver menos" : `Ver mais ${ocultos}`}
          <i className={expandido ? "ph-bold ph-caret-up" : "ph-bold ph-caret-down"} style={{ fontSize: 12 }}></i>
        </button>
      )}
    </>
  );
}
