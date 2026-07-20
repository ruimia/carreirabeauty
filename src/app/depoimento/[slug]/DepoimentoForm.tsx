"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { maskPhone } from "@/lib/cep";

export default function DepoimentoForm({ professionalId }: { professionalId: string }) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [estrelas, setEstrelas] = useState(0);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!nome.trim() || !telefone.trim() || !texto.trim() || estrelas === 0) {
      setError("Preenche seu nome, WhatsApp, a nota e o depoimento pra gente poder enviar.");
      return;
    }
    setLoading(true);
    const { error: insErr } = await supabase.from("depoimentos").insert({
      professional_id: professionalId,
      nome_cliente: nome.trim(),
      telefone_cliente: telefone.replace(/\D/g, ""),
      estrelas,
      texto: texto.trim(),
    });
    setLoading(false);
    if (insErr) {
      setError(insErr.code === "23505"
        ? "Parece que você já deixou um depoimento pra esse profissional. Obrigado! 💛"
        : "Não deu pra enviar agora. Tenta de novo em instantes.");
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div style={{
        background: "var(--surface-card)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xs)", padding: 28, textAlign: "center",
      }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>🎉</div>
        <p style={{ font: "700 17px/1.3 var(--font-display)", color: "var(--text-primary)", marginBottom: 6 }}>
          Depoimento enviado!
        </p>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)" }}>
          Obrigado por avaliar — assim que o profissional aprovar, seu depoimento aparece no perfil dela.
        </p>
      </div>
    );
  }

  const inp: React.CSSProperties = {
    width: "100%", height: 46, padding: "0 14px",
    borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
    background: "var(--surface-card)", fontFamily: "var(--font-body)", fontSize: 15,
    color: "var(--text-primary)", outline: "none",
  };

  return (
    <div style={{
      background: "var(--surface-card)", border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xs)", padding: 20,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: 10, textAlign: "center" }}>
          Sua nota
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setEstrelas(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <i className={n <= estrelas ? "ph-fill ph-star" : "ph ph-star"} style={{ fontSize: 32, color: n <= estrelas ? "#ffb020" : "var(--text-tertiary)" }}></i>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-brand-primary)", marginBottom: 6 }}>Seu nome</p>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como você quer aparecer no depoimento" style={inp} />
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-brand-primary)", marginBottom: 6 }}>Seu WhatsApp</p>
        <input type="tel" inputMode="numeric" value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} placeholder="(11) 99999-9999" style={inp} />
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>Não aparece pra ninguém, é só pra confirmação.</p>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-brand-primary)", marginBottom: 6 }}>Seu depoimento</p>
        <textarea rows={4} maxLength={500} value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Conte como foi o atendimento…"
          style={{ ...inp, height: "auto", padding: "10px 14px", resize: "none", lineHeight: 1.6 }} />
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "var(--color-danger-fg)", background: "var(--color-danger-bg)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
          {error}
        </p>
      )}

      <button onClick={handleSubmit} disabled={loading} style={{
        height: 48, borderRadius: "var(--radius-pill)", border: "none",
        background: "var(--color-brand-primary)", color: "#fff",
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, cursor: "pointer",
        opacity: loading ? 0.6 : 1,
      }}>
        {loading ? "Enviando…" : "Enviar depoimento"}
      </button>
    </div>
  );
}
