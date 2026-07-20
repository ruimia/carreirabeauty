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
      background: "linear-gradient(135deg, #DC00DC, #ffb020, #DC00DC)",
      opacity: conquistado ? 1 : 0.9,
    }}>
      <div style={{
        borderRadius: "calc(var(--radius-xl) - 3px)", background: "var(--surface-card)",
        padding: "28px 20px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* selo canto superior — mesma moldura dourada nos dois estados, só o
            texto muda; a cor não pode ser o que diferencia bloqueado de
            conquistado, senão o preview parece "menos valioso" */}
        <span style={{
          position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 800,
          letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 999,
          background: conquistado ? "var(--color-success-bg)" : "var(--brand-magenta-50)",
          color: conquistado ? "var(--color-success-fg)" : "var(--color-brand-primary)",
        }}>
          {conquistado ? "✓ CONQUISTADO" : "PRÉVIA — complete a trilha"}
        </span>

        <div style={{
          width: 56, height: 56, margin: "0 auto 14px", borderRadius: "50%",
          background: "linear-gradient(135deg, #DC00DC, #ffb020)",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          boxShadow: "0 6px 18px rgba(220,0,220,0.3)",
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

        {/* dica de compartilhar — planta a ideia mesmo antes de conquistar;
            desabilitada no preview, funcional quando já é dele de verdade */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          marginTop: 16, opacity: conquistado ? 1 : 0.5,
        }}>
          <i className="ph-fill ph-share-network" style={{ fontSize: 13, color: "var(--color-brand-primary)" }}></i>
          <span style={{ font: "700 11px/1 var(--font-body)", color: "var(--color-brand-primary)" }}>
            {conquistado ? "Compartilhe no seu perfil" : "Você vai poder compartilhar isso"}
          </span>
        </div>
      </div>
    </div>
  );
}
