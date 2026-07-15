import { PerfilTemplateProps, iniciais } from "./types";
import { PlaceholderPortfolio } from "./TemplateClassico";

// Tema PRO — banner grande, portfólio logo no topo (vitrine visual pra quem
// já tem trabalho pra mostrar e quer atrair cliente, não só recrutador).
export default function TemplateVitrine({ p, preview }: PerfilTemplateProps) {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 48px" }}>
      <div style={{
        background: "linear-gradient(135deg, var(--color-brand-primary), var(--brand-magenta-700, #9a0091))",
        padding: "40px 20px 32px", textAlign: "center", color: "#fff",
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginBottom: 20,
      }}>
        {p.fotoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.fotoUrl} alt={p.nome} style={{ width: 104, height: 104, borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(255,255,255,0.7)", margin: "0 auto 14px" }} />
          : <div style={{ width: 104, height: 104, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", border: "4px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, margin: "0 auto 14px" }}>{iniciais(p.nome)}</div>
        }
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, marginBottom: 4 }}>{p.nome}</h1>
        <p style={{ fontSize: 15, fontWeight: 700, opacity: 0.95, marginBottom: 6 }}>{p.funcao}</p>
        <p style={{ fontSize: 13, opacity: 0.85 }}>📍 {p.cidade} · {p.estado}</p>

        {p.instagram && (
          <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
            height: 36, padding: "0 16px", borderRadius: "var(--radius-pill)",
            background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>
            📷 @{p.instagram}
          </a>
        )}
      </div>

      <div style={{ padding: "0 20px" }}>
        {p.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 }}>
            {p.tags.map((tag) => (
              <span key={tag} style={{ background: "var(--brand-magenta-50)", color: "var(--color-brand-primary)", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: "var(--radius-pill)" }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Portfólio em destaque, logo no topo */}
        {(p.portfolioUrls.length > 0 || preview) && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 12, textAlign: "center" }}>✨ Trabalhos recentes</p>
            {p.portfolioUrls.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {p.portfolioUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 16, boxShadow: "var(--shadow-sm)" }} />
                ))}
              </div>
            ) : (
              <PlaceholderPortfolio />
            )}
          </div>
        )}

        {(p.apresentacao || preview) && (
          <VitrineSection title="Sobre">
            <p style={{ fontSize: 14, color: p.apresentacao ? "var(--text-secondary)" : "var(--text-tertiary)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontStyle: p.apresentacao ? "normal" : "italic" }}>
              {p.apresentacao || "Conte um pouco sobre você aqui — sua experiência, seu estilo de trabalho, o que te diferencia."}
            </p>
          </VitrineSection>
        )}

        {[
          { label: "Experiência", value: p.experiencia },
          { label: "Disponibilidade", value: p.disponibilidade },
          { label: "Tipo de vínculo", value: p.tipoVinculo },
        ].filter((r) => r.value).length > 0 && (
          <VitrineSection title="Informações profissionais">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Experiência", value: p.experiencia },
                { label: "Disponibilidade", value: p.disponibilidade },
                { label: "Tipo de vínculo", value: p.tipoVinculo },
              ].filter((r) => r.value).map((r) => (
                <div key={r.label}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{r.label}</p>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{r.value}</p>
                </div>
              ))}
            </div>
          </VitrineSection>
        )}

        {p.habilidades.length > 0 && (
          <VitrineSection title="Especialidades">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.habilidades.map((h) => (
                <span key={h} style={{ background: "var(--brand-magenta-50)", color: "var(--color-brand-primary)", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: "var(--radius-pill)" }}>{h}</span>
              ))}
            </div>
          </VitrineSection>
        )}

        {p.experienciaProf.length > 0 && (
          <VitrineSection title="Experiência">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {p.experienciaProf.map((exp, i) => (
                <div key={i}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{exp.cargo}</p>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </div>
          </VitrineSection>
        )}

        {p.educacao.length > 0 && (
          <VitrineSection title="Formação e cursos">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {p.educacao.map((edu, i) => (
                <div key={i}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{edu.curso}</p>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </div>
          </VitrineSection>
        )}
      </div>
    </main>
  );
}

function VitrineSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--color-brand-primary)", marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  );
}
