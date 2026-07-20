"use client";

import { useState } from "react";
import { EventoAtividade } from "@/lib/atividadeRecente";

function tempoRelativo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  return `há ${horas}h`;
}

// maxVisivel: quando informado, colapsa a lista e mostra um "Ver mais". Sem ele
// o comportamento é o de antes (lista inteira) — a landing e o dashboard da
// empresa continuam iguais.
export default function AtividadeRecente({ eventos, maxVisivel }: {
  eventos: EventoAtividade[];
  maxVisivel?: number;
}) {
  const [expandido, setExpandido] = useState(false);

  if (eventos.length === 0) return null;

  const podeColapsar = typeof maxVisivel === "number" && eventos.length > maxVisivel;
  const visiveis = podeColapsar && !expandido ? eventos.slice(0, maxVisivel) : eventos;
  const ocultos = podeColapsar ? eventos.length - maxVisivel : 0;

  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
      border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
      padding: "14px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success-fg)", flexShrink: 0 }} />
        <p style={{ font: "700 12px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Acontecendo agora no CarreiraBeauty
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visiveis.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <i className={ev.tipo === "profissional" ? "ph-fill ph-user-circle" : "ph-fill ph-storefront"} style={{
              fontSize: 15, color: "var(--color-brand-primary)", marginTop: 2, flexShrink: 0,
            }}></i>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.5, flex: 1 }}>
              {ev.texto}
              {/* horário calculado no cliente diverge do render do servidor por
                  alguns segundos — diferença esperada, não é erro de markup */}
              <span suppressHydrationWarning style={{ color: "var(--text-tertiary)", fontSize: 12 }}> · {tempoRelativo(ev.criadoEm)}</span>
            </p>
          </div>
        ))}
      </div>

      {podeColapsar && (
        <button
          onClick={() => setExpandido((v) => !v)}
          style={{
            width: "100%", marginTop: 12, paddingTop: 10, height: 34,
            borderTop: "1px solid var(--border-default)", border: "none",
            borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--border-default)",
            background: "none", cursor: "pointer",
            font: "700 13px/1 var(--font-body)", color: "var(--color-brand-primary)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          {expandido ? "Ver menos" : `Ver mais ${ocultos}`}
          <i className={expandido ? "ph-bold ph-caret-up" : "ph-bold ph-caret-down"} style={{ fontSize: 12 }}></i>
        </button>
      )}
    </div>
  );
}
