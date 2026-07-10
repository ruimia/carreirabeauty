"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  app: {
    id: string;
    criado_em: string;
    mensagem: string | null;
    professional: {
      id: string;
      nome: string;
      telefone: string | null;
      funcoes: string[] | null;
      funcao: string | null;
      funcao_outro: string | null;
      cidade: string | null;
      estado: string | null;
      experiencia: string | null;
      disponibilidade: string | null;
      tipo_vinculo: string | null;
      foto_perfil_url: string | null;
      slug: string | null;
      educacao_basica: string | null;
      habilidades: string[] | null;
      educacao: { curso: string; instituicao: string; ano: string }[] | null;
      experiencia_prof: { empresa: string; cargo: string; periodo: string }[] | null;
      portfolio_urls: string[] | null;
      instagram: string | null;
    };
  };
  funcaoVaga: string;
}

export default function CandidatoCard({ app, funcaoVaga }: Props) {
  const [open, setOpen] = useState(false);
  const p = app.professional;

  const initials = p.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() ?? "?";
  const whatsapp = p.telefone?.replace(/\D/g, "");
  const whatsappUrl = whatsapp
    ? `https://wa.me/55${whatsapp}?text=${encodeURIComponent(`Olá ${p.nome}, vi sua candidatura no CarreiraBeauty para a vaga de ${funcaoVaga}!`)}`
    : null;

  const funcao = p.funcoes?.join(", ") || p.funcao || "—";

  const hasExtra =
    p.educacao_basica ||
    (p.habilidades?.length ?? 0) > 0 ||
    (p.educacao?.length ?? 0) > 0 ||
    (p.experiencia_prof?.length ?? 0) > 0 ||
    (p.portfolio_urls?.length ?? 0) > 0 ||
    p.instagram;

  const tag: React.CSSProperties = {
    background: "var(--neutral-100)", color: "var(--text-secondary)",
    fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--radius-pill)",
    display: "inline-flex", alignItems: "center", gap: 4,
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.08em", color: "var(--text-tertiary)",
    marginBottom: 6, marginTop: 14,
  };

  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: 16 }}>
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
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
              {p.nome}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-primary)", marginTop: 1 }}>
              {funcao}
            </p>
            {p.cidade && (
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <i className="ph ph-map-pin"></i> {p.cidade}{p.estado ? ` · ${p.estado}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Tags rápidas */}
        {(p.experiencia || p.disponibilidade || p.tipo_vinculo) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {p.experiencia && <span style={tag}><i className="ph ph-clock"></i> {p.experiencia}</span>}
            {p.disponibilidade && <span style={tag}><i className="ph ph-calendar-check"></i> {p.disponibilidade}</span>}
            {p.tipo_vinculo && <span style={tag}><i className="ph ph-file-text"></i> {p.tipo_vinculo.toUpperCase()}</span>}
          </div>
        )}

        {/* Ações */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {hasExtra && (
            <button onClick={() => setOpen(!open)} style={{
              flex: 1, height: 40, borderRadius: "var(--radius-pill)",
              border: `1px solid ${open ? "var(--color-brand-primary)" : "var(--border-default)"}`,
              background: open ? "var(--brand-magenta-50)" : "var(--surface-card)",
              color: open ? "var(--color-brand-primary)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <i className={open ? "ph ph-caret-up" : "ph ph-caret-down"}></i> {open ? "Menos" : "Ver mais"}
            </button>
          )}
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
        </div>

        {app.mensagem && (
          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: "var(--surface-sunken)", borderRadius: "var(--radius-md)",
            borderLeft: "3px solid var(--border-default)",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Mensagem
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {app.mensagem}
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: "var(--neutral-400)", marginTop: 10 }}>
          Candidatou-se em {new Date(app.criado_em).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Accordion */}
      {open && hasExtra && (
        <div style={{
          borderTop: "1px solid var(--border-default)",
          padding: "4px 16px 16px",
          background: "var(--surface-sunken)",
        }}>

          {p.educacao_basica && (
            <>
              <p style={sectionLabel}>Apresentação</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {p.educacao_basica}
              </p>
            </>
          )}

          {(p.habilidades?.length ?? 0) > 0 && (
            <>
              <p style={sectionLabel}>Habilidades</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.habilidades!.map((h) => (
                  <span key={h} style={{
                    background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)",
                    fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--brand-cyan-100)",
                  }}>{h}</span>
                ))}
              </div>
            </>
          )}

          {(p.educacao?.length ?? 0) > 0 && (
            <>
              <p style={sectionLabel}>Formação</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.educacao!.map((edu, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text-primary)" }}>
                    <span style={{ fontWeight: 600 }}>{edu.curso}</span>
                    {edu.instituicao && <span style={{ color: "var(--text-tertiary)" }}> · {edu.instituicao}</span>}
                    {edu.ano && <span style={{ color: "var(--text-tertiary)" }}> · {edu.ano}</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {(p.experiencia_prof?.length ?? 0) > 0 && (
            <>
              <p style={sectionLabel}>Experiência profissional</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.experiencia_prof!.map((exp, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text-primary)" }}>
                    <span style={{ fontWeight: 600 }}>{exp.cargo}</span>
                    {exp.empresa && <span style={{ color: "var(--text-tertiary)" }}> · {exp.empresa}</span>}
                    {exp.periodo && <span style={{ color: "var(--text-tertiary)" }}> · {exp.periodo}</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {(p.portfolio_urls?.length ?? 0) > 0 && (
            <>
              <p style={sectionLabel}>Portfólio</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.portfolio_urls!.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Portfólio ${i + 1}`} style={{
                      width: 72, height: 72, objectFit: "cover",
                      borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
                    }} />
                  </a>
                ))}
              </div>
            </>
          )}

          {p.instagram && (
            <>
              <p style={sectionLabel}>Instagram</p>
              <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: "var(--color-brand-primary)", textDecoration: "none", fontWeight: 600 }}>
                @{p.instagram}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
