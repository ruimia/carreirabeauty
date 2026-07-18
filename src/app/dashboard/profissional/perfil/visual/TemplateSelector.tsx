"use client";

import { useState } from "react";
import Link from "next/link";
import { PerfilTemplateData, TEMPLATES, TemplateId } from "@/components/perfilTemplates/types";
import TemplateClassico from "@/components/perfilTemplates/TemplateClassico";
import TemplateVitrine from "@/components/perfilTemplates/TemplateVitrine";
import TemplateElegante from "@/components/perfilTemplates/TemplateElegante";
import TemplateAurora from "@/components/perfilTemplates/TemplateAurora";
import TemplateEstudio from "@/components/perfilTemplates/TemplateEstudio";
import { registrarPreview, aplicarTemplate } from "./actions";

const COMPONENTES = {
  classico: TemplateClassico,
  vitrine: TemplateVitrine,
  elegante: TemplateElegante,
  aurora: TemplateAurora,
  estudio: TemplateEstudio,
};

export default function TemplateSelector({ data, templateAtual, isPro }: {
  data: PerfilTemplateData; templateAtual: string; isPro: boolean;
}) {
  const [selecionado, setSelecionado] = useState<TemplateId>((templateAtual as TemplateId) ?? "classico");
  const [aplicado, setAplicado] = useState(templateAtual);
  const [salvando, setSalvando] = useState(false);
  const [mostrarPaywall, setMostrarPaywall] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const templateInfo = TEMPLATES.find((t) => t.id === selecionado)!;
  const Componente = COMPONENTES[selecionado];

  function selecionar(id: TemplateId) {
    setSelecionado(id);
    setSucesso(false);
    const info = TEMPLATES.find((t) => t.id === id);
    if (info?.pro && !isPro) registrarPreview(id);
  }

  async function handleAplicar() {
    setSalvando(true);
    setSucesso(false);
    try {
      const resultado = await aplicarTemplate(selecionado, templateInfo.pro);
      if (!resultado.ok && resultado.motivo === "paywall") {
        setMostrarPaywall(true);
      } else if (resultado.ok) {
        setAplicado(selecionado);
        setSucesso(true);
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      {/* Carrossel de opções — largura fixa por card, com scroll-snap horizontal
          (5 templates não cabem espremidos numa faixa só, como fazia sentido
          quando eram 3) */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 16, overflowX: "auto",
        scrollSnapType: "x mandatory", paddingBottom: 4, WebkitOverflowScrolling: "touch",
      }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => selecionar(t.id)}
            style={{
              flex: "0 0 auto", scrollSnapAlign: "start", minWidth: 108, height: 44, padding: "0 16px",
              borderRadius: "var(--radius-md)", whiteSpace: "nowrap",
              border: `2px solid ${selecionado === t.id ? "var(--color-brand-primary)" : "var(--border-default)"}`,
              background: selecionado === t.id ? "var(--brand-magenta-50)" : "var(--surface-card)",
              color: selecionado === t.id ? "var(--brand-magenta-700)" : "var(--text-primary)",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
            }}
          >
            {t.nome}
            {t.pro && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: "var(--radius-pill)",
                background: "var(--color-brand-primary)", color: "#fff",
              }}>PRO</span>
            )}
          </button>
        ))}
      </div>

      {aplicado === selecionado && (
        <p style={{ fontSize: 13, color: "var(--color-success-fg)", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
          ✓ Este é o visual ativo do seu perfil
        </p>
      )}

      {/* Preview ao vivo */}
      <div style={{
        borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--border-default)",
        marginBottom: 16, background: "var(--surface-page)",
      }}>
        <Componente p={data} preview contatosBloqueados={!isPro} />
      </div>

      {sucesso && (
        <p style={{ fontSize: 13, color: "var(--color-success-fg)", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
          ✓ Visual aplicado! Seu perfil público já está atualizado.
        </p>
      )}

      <button
        onClick={handleAplicar}
        disabled={salvando || aplicado === selecionado}
        style={{
          width: "100%", height: 52, borderRadius: "var(--radius-pill)", border: "none",
          background: aplicado === selecionado ? "var(--neutral-200)" : "var(--color-brand-primary)",
          color: aplicado === selecionado ? "var(--text-tertiary)" : "#fff",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16,
          cursor: aplicado === selecionado ? "default" : "pointer",
        }}
      >
        {salvando ? "Salvando…" : aplicado === selecionado ? "Visual já aplicado" : "Aplicar este visual"}
      </button>

      {/* Modal de paywall */}
      {mostrarPaywall && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)", padding: 28,
            maxWidth: 340, width: "100%", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
              Esse visual é exclusivo do PRO
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 20 }}>
              Vire PRO pra aplicar o tema &quot;{templateInfo.nome}&quot; no seu perfil público e se destacar mais.
            </p>
            <Link href="/dashboard/profissional/planos" style={{
              display: "block", height: 48, borderRadius: "var(--radius-pill)",
              background: "var(--color-brand-primary)", color: "#fff",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
              textDecoration: "none", lineHeight: "48px", marginBottom: 10,
            }}>
              Ver planos PRO
            </Link>
            <button
              onClick={() => setMostrarPaywall(false)}
              style={{
                width: "100%", height: 40, borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-default)", background: "transparent",
                color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
                cursor: "pointer",
              }}
            >
              Continuar navegando
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
