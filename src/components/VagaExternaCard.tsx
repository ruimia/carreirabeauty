"use client";

import { createClient } from "@/lib/supabase/client";

interface VagaExterna {
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
}

// Adzuna sempre retorna salário anualizado (padrão deles pra comparação entre
// países) — convertemos pra mensal, que é a convenção local (R$/mês)
function formatoSalario(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `R$ ${Math.round(n / 12).toLocaleString("pt-BR")}`;
  if (min && max && min !== max) return `${fmt(min)} - ${fmt(max)}/mês`;
  return `${fmt(min ?? max!)}/mês`;
}

export default function VagaExternaCard({ vaga, professionalId, publicadoRelativo }: {
  vaga: VagaExterna; professionalId: string; publicadoRelativo?: string | null;
}) {
  const supabase = createClient();
  const salario = formatoSalario(vaga.salario_min, vaga.salario_max);

  function handleClick() {
    supabase.from("vagas_externas_clicks").insert({ vaga_externa_id: vaga.id, professional_id: professionalId }).then(() => {});
  }

  return (
    <a href={vaga.url} target="_blank" rel="noopener noreferrer" onClick={handleClick} style={{ textDecoration: "none" }}>
      <div className="job-feed-card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ font: "500 11px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
              {vaga.empresa ?? "Empresa não informada"}
              {vaga.cidade ? ` · ${vaga.cidade}${vaga.estado ? ", " + vaga.estado : ""}` : ""}
            </p>
            <p style={{ font: "600 17px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
              {vaga.titulo}
            </p>
          </div>
          {salario && (
            <span className="chip" style={{ background: "var(--brand-magenta-50)", color: "var(--brand-magenta-700)", flexShrink: 0 }}>
              <i className="ph ph-currency-circle-dollar"></i> {salario}
            </span>
          )}
        </div>

        {vaga.descricao && (
          <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {vaga.descricao}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          {publicadoRelativo && (
            <span className="tag"><i className="ph ph-clock"></i> {publicadoRelativo}</span>
          )}
          <i className="ph ph-arrow-square-out" style={{ fontSize: 18, color: "var(--text-tertiary)", flexShrink: 0, marginLeft: "auto" }}></i>
        </div>
      </div>
    </a>
  );
}
