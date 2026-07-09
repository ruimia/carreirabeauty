"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Props {
  jobId: string;
  professionalId: string | null; // null = não logado ou é empresa
  jaAplicou: boolean;
  nomeProfissional: string | null;
}

export default function CandidaturaSection({ jobId, professionalId, jaAplicou, nomeProfissional }: Props) {
  const [enviado, setEnviado] = useState(jaAplicou);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleCandidatar() {
    if (!professionalId) return;
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.from("applications").insert({
        job_id: jobId,
        professional_id: professionalId,
        mensagem: mensagem.trim() || null,
      });
      if (err) {
        if (err.code === "23505") { setEnviado(true); return; } // já aplicou
        throw new Error(err.message);
      }
      setEnviado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar.");
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

      {error && (
        <p style={{ fontSize: 13, color: "var(--color-danger-fg)", marginTop: 8 }}>{error}</p>
      )}

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
