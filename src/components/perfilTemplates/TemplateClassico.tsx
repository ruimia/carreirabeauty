import { PerfilTemplateProps, iniciais } from "./types";

// Tema padrão (grátis) — mesmo visual que a página pública sempre teve.
export default function TemplateClassico({ p, preview }: PerfilTemplateProps) {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 48px" }}>
      <div style={{
        background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)", overflow: "hidden", marginBottom: 16,
      }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
            {p.fotoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.fotoUrl} alt={p.nome} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "4px solid var(--surface-card)", flexShrink: 0 }} />
              : <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--brand-blush-100)", color: "var(--brand-magenta-500)", border: "4px solid var(--surface-card)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, flexShrink: 0 }}>{iniciais(p.nome)}</div>
            }
            {p.instagram && (
              <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" style={{ height: 36, padding: "0 14px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                <span style={{ fontSize: 15 }}>📷</span> @{p.instagram}
              </a>
            )}
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", marginBottom: 2 }}>{p.nome}</h1>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-brand-primary)", marginBottom: 6 }}>{p.funcao}</p>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>📍 {[p.bairro, p.cidade].filter(Boolean).join(", ")} · {p.estado}</p>

          {p.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {p.tags.map((tag) => (
                <span key={tag} style={{ background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--brand-cyan-100)" }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {(p.apresentacao || preview) && (
        <Section title="Quem sou eu">
          <p style={{ fontSize: 14, color: p.apresentacao ? "var(--text-secondary)" : "var(--text-tertiary)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontStyle: p.apresentacao ? "normal" : "italic" }}>
            {p.apresentacao || "Conte um pouco sobre você aqui — sua experiência, seu estilo de trabalho, o que te diferencia."}
          </p>
        </Section>
      )}

      <Section title="Informações profissionais">
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
      </Section>

      {p.habilidades.length > 0 && (
        <Section title="Habilidades">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {p.habilidades.map((h) => (
              <span key={h} style={{ background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--brand-cyan-100)" }}>{h}</span>
            ))}
          </div>
        </Section>
      )}

      {p.educacao.length > 0 && (
        <Section title="Formação e cursos">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {p.educacao.map((edu, i) => (
              <div key={i}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{edu.curso}</p>
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {p.experienciaProf.length > 0 && (
        <Section title="Experiência profissional">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {p.experienciaProf.map((exp, i) => (
              <div key={i}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{exp.cargo}</p>
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(p.portfolioUrls.length > 0 || preview) && (
        <Section title="Portfólio">
          {p.portfolioUrls.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {p.portfolioUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : (
            <PlaceholderPortfolio />
          )}
        </Section>
      )}
    </main>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)", padding: 20, marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>{title}</p>
      {children}
    </div>
  );
}

export function PlaceholderPortfolio() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: "100%", aspectRatio: "1", borderRadius: "var(--radius-md)",
          background: "var(--surface-sunken)", border: "1px dashed var(--border-default)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "var(--text-tertiary)",
        }}>
          🖼️
        </div>
      ))}
      <p style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", fontStyle: "italic", marginTop: 4 }}>
        Adicione fotos do seu trabalho aqui
      </p>
    </div>
  );
}
