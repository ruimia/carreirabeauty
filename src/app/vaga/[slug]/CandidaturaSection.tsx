"use client";

import { useState } from "react";
import Link from "next/link";
import { candidatar } from "./actions";

interface Props {
  jobId: string;
  professionalId: string | null; // null = não logado ou é empresa
  jaAplicou: boolean;
  nomeProfissional: string | null;
  empresaNome: string | null;
  empresaWhatsapp: string | null;
}

export default function CandidaturaSection({ jobId, professionalId, jaAplicou, nomeProfissional, empresaNome, empresaWhatsapp }: Props) {
  const [enviado, setEnviado] = useState(jaAplicou);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCandidatar() {
    if (!professionalId) return;
    setLoading(true); setError("");
    try {
      const result = await candidatar(jobId, mensagem.trim() || null);
      if (!result.ok) {
        if (result.error === "LIMITE_PLANO") { setError("LIMITE"); return; }
        setError("Erro ao enviar candidatura. Tente novamente.");
        return;
      }
      setEnviado(true);
    } catch {
      setError("Erro ao enviar candidatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Não logado ou é empresa
  if (!professionalId) {
    return (
      <div>
        <Link href="/login" style={{ textDecoration: "none" }}>
          <button style={btnStyle("#DC00DC")}>
            Quero me candidatar
          </button>
        </Link>
        <p style={subStyle}>Crie sua conta ou entre para enviar sua candidatura</p>
      </div>
    );
  }

  // Já candidatou
  if (enviado) {
    return (
      <div style={{
        background: "var(--color-success-bg)", border: "1px solid var(--color-success-border, #BBF7D0)",
        borderRadius: "var(--radius-xl)", padding: "20px 24px", textAlign: "center",
      }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>✅</p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--color-success-fg)" }}>
          Candidatura enviada!
        </p>
        <p style={{ fontSize: 14, color: "var(--color-success-fg)", marginTop: 4, opacity: 0.8 }}>
          A empresa receberá seu perfil e entrará em contato se tiver interesse.
        </p>

        {empresaWhatsapp && (
          <div style={{
            marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-success-border, #BBF7D0)",
          }}>
            <p style={{ fontSize: 13, color: "var(--color-success-fg)", opacity: 0.85, marginBottom: 10 }}>
              Quer acelerar? Manda uma mensagem direto pro WhatsApp{empresaNome ? ` da ${empresaNome}` : ""}.
            </p>
            <a
              href={`https://wa.me/55${empresaWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Olá! Vi a vaga no CarreiraBeauty e acabei de me candidatar${nomeProfissional ? ` (${nomeProfissional})` : ""}. Gostaria de conversar sobre a oportunidade.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                background: "#25d366", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700,
                fontSize: 14, padding: "12px 22px", borderRadius: "var(--radius-pill)",
              }}
            >
              <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: 18 }}></i>
              Chamar no WhatsApp
            </a>
          </div>
        )}
      </div>
    );
  }

  // Form de candidatura
  return (
    <div style={{
      background: "var(--surface-card)", border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xs)", padding: 20,
    }}>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>
        Enviar candidatura
      </p>
      {nomeProfissional && (
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 14 }}>
          Como <strong>{nomeProfissional}</strong>
        </p>
      )}

      <textarea
        rows={4}
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Apresente-se brevemente: por que você é a pessoa certa para essa vaga? (opcional)"
        style={{
          width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)", background: "var(--surface-sunken)",
          fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)",
          lineHeight: 1.6, resize: "none", outline: "none",
        }}
      />

      {error === "LIMITE" ? (
        <div style={{ marginTop: 10, padding: "12px 14px", background: "var(--brand-magenta-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--brand-magenta-200, #f0abfc)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-brand-primary)", marginBottom: 4 }}>Limite de candidaturas atingido</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>Você usou suas 10 candidaturas do mês. Faça upgrade para o plano Pro e candidate-se sem limites.</p>
          <a href="/dashboard/profissional/planos" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "var(--color-brand-primary)", padding: "8px 18px", borderRadius: "var(--radius-pill)", textDecoration: "none", display: "inline-block" }}>
            Ver plano Pro →
          </a>
        </div>
      ) : error ? (
        <p style={{ fontSize: 13, color: "var(--color-danger-fg)", marginTop: 8 }}>{error}</p>
      ) : null}

      <button onClick={handleCandidatar} disabled={loading} style={{ ...btnStyle("#DC00DC"), marginTop: 12 }}>
        {loading ? "Enviando…" : "Enviar candidatura"}
      </button>
    </div>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  width: "100%", height: 52, borderRadius: "var(--radius-pill)", border: "none",
  background: bg, color: "#fff",
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, cursor: "pointer",
  display: "block",
});

const subStyle: React.CSSProperties = {
  textAlign: "center", fontSize: 13, color: "var(--text-tertiary)", marginTop: 10,
};
