// Prévia visual do certificado — mesmo componente usado no início da trilha
// (pra gerar desejo: "é isso que você ganha") e no final (quando conquistado).
// Estilo de certificado de verdade (moldura, selo, ornamento), não um ícone solto.
export default function CertificadoVisual({ trilhaNome, nome, estado }: {
  trilhaNome: string;
  nome?: string | null;
  estado: "preview" | "conquistado";
}) {
  const conquistado = estado === "conquistado";

  return (
    <div style={{
      position: "relative", borderRadius: "var(--radius-xl)", padding: 3,
      background: conquistado
        ? "linear-gradient(135deg, #DC00DC, #ffb020, #DC00DC)"
        : "repeating-linear-gradient(135deg, var(--brand-magenta-100) 0 10px, var(--surface-sunken) 10px 20px)",
    }}>
      <div style={{
        borderRadius: "calc(var(--radius-xl) - 3px)", background: "var(--surface-card)",
        padding: "28px 20px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* selo canto superior */}
        <span style={{
          position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 800,
          letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 999,
          background: conquistado ? "var(--color-success-bg)" : "var(--surface-sunken)",
          color: conquistado ? "var(--color-success-fg)" : "var(--text-tertiary)",
        }}>
          {conquistado ? "✓ CONQUISTADO" : "PRÉVIA"}
        </span>

        <div style={{
          width: 56, height: 56, margin: "0 auto 14px", borderRadius: "50%",
          background: conquistado ? "linear-gradient(135deg, #DC00DC, #ffb020)" : "var(--brand-magenta-50)",
          color: conquistado ? "#fff" : "var(--color-brand-primary)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          boxShadow: conquistado ? "0 6px 18px rgba(220,0,220,0.3)" : "none",
        }}>
          <i className="ph-fill ph-medal"></i>
        </div>

        <p style={{ font: "700 10px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          Certificado de Conclusão
        </p>
        <p style={{ font: "800 19px/1.3 var(--font-display)", color: "var(--text-primary)", marginBottom: 10 }}>
          {trilhaNome}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 28, height: 1, background: "var(--border-default)" }} />
          <i className="ph-fill ph-sparkle" style={{ fontSize: 10, color: "var(--color-brand-primary)" }}></i>
          <span style={{ width: 28, height: 1, background: "var(--border-default)" }} />
        </div>

        <p style={{ font: "600 13px/1.3 var(--font-body)", color: "var(--text-secondary)" }}>
          {nome || "Seu nome aqui"}
        </p>
        <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 2 }}>
          CarreiraBeauty
        </p>
      </div>
    </div>
  );
}
