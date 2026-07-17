"use client";

import { useState } from "react";
import Link from "next/link";
import { convidarPorEmail } from "./actions";

interface Professional {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  funcoes: string[] | null;
  funcao: string | null;
  funcao_outro: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  experiencia: string | null;
  disponibilidade: string | null;
  tipo_vinculo: string | null;
  foto_perfil_url: string | null;
  slug: string | null;
  plano: string | null;
}

interface Props {
  professional: Professional;
  vagas: { id: string; titulo: string }[];
}

export default function CandidatoPotencialCard({ professional: p, vagas }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const isPro = p.plano === "pro";
  const initials = p.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() ?? "?";
  const funcao = p.funcoes?.join(", ") || p.funcao || "—";
  const tituloVagas = vagas.map((v) => v.titulo).join(", ");

  const whatsapp = p.telefone?.replace(/\D/g, "");
  const whatsappUrl = whatsapp
    ? `https://wa.me/55${whatsapp}?text=${encodeURIComponent(
        `Olá ${p.nome}! Vi seu perfil no CarreiraBeauty e temos uma vaga de ${tituloVagas} que pode combinar com você. Topa conversar?`
      )}`
    : null;

  async function handleConvidarEmail() {
    setEnviando(true);
    setErro("");
    try {
      await convidarPorEmail(p.user_id, vagas[0].id);
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao enviar convite.");
    } finally {
      setEnviando(false);
    }
  }

  const tag: React.CSSProperties = {
    background: "var(--neutral-100)", color: "var(--text-secondary)",
    fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--radius-pill)",
    display: "inline-flex", alignItems: "center", gap: 4,
  };

  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
      border: isPro ? "1.5px solid var(--color-brand-primary)" : "1px solid var(--border-default)",
      boxShadow: isPro ? "var(--shadow-sm)" : "var(--shadow-xs)",
      padding: 16,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {p.foto_perfil_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.foto_perfil_url} alt={p.nome}
              style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          : (
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: "var(--brand-cyan-50)", color: "var(--brand-cyan-600)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20,
            }}>
              {initials}
            </div>
          )
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
              {p.nome}
            </p>
            {isPro && (
              <span style={{
                background: "var(--color-brand-primary)", color: "#fff",
                fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
                padding: "2px 7px", borderRadius: "var(--radius-pill)",
              }}>
                ✦ PRO
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-primary)", marginTop: 1 }}>
            {funcao}
          </p>
          {p.cidade && (
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <i className="ph ph-map-pin"></i> {[p.bairro, p.cidade].filter(Boolean).join(", ")}{p.estado ? ` · ${p.estado}` : ""}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {p.experiencia && <span style={tag}><i className="ph ph-clock"></i> {p.experiencia}</span>}
        {p.disponibilidade && <span style={tag}><i className="ph ph-calendar-check"></i> {p.disponibilidade}</span>}
        {vagas.map((v) => (
          <span key={v.id} style={{ ...tag, background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)" }}>
            <i className="ph ph-briefcase"></i> {v.titulo}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {p.slug && (
          <Link href={`/perfil/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, height: 40, borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-default)", background: "var(--surface-card)",
            color: "var(--text-primary)", fontFamily: "var(--font-body)", fontWeight: 600,
            fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", gap: 5,
          }}>
            Perfil <i className="ph ph-arrow-square-out"></i>
          </Link>
        )}
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, height: 40, borderRadius: "var(--radius-pill)",
            background: "#25D366", color: "#fff",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", gap: 6,
          }}>
            <i className="ph ph-whatsapp-logo" style={{ fontSize: 16 }}></i> WhatsApp
          </a>
        )}
        <button
          onClick={handleConvidarEmail}
          disabled={enviando || enviado}
          style={{
            flex: 1, height: 40, borderRadius: "var(--radius-pill)",
            border: "none", background: enviado ? "var(--color-success-bg)" : "var(--color-brand-primary)",
            color: enviado ? "var(--color-success-fg)" : "#fff",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            cursor: enviando || enviado ? "default" : "pointer", opacity: enviando ? 0.7 : 1,
          }}
        >
          <i className={enviado ? "ph-fill ph-check-circle" : "ph ph-envelope-simple"} style={{ fontSize: 16 }}></i>
          {enviado ? "Convite enviado" : enviando ? "Enviando…" : "Enviar email"}
        </button>
      </div>

      {erro && <p style={{ fontSize: 12, color: "var(--color-danger-fg)", marginTop: 8 }}>{erro}</p>}
    </div>
  );
}
