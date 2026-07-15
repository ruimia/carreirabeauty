import { PerfilTemplateProps, iniciais } from "./types";
import { PlaceholderPortfolio } from "./TemplateClassico";

const OURO = "#c9a227";

// Tema PRO — minimalista, escuro/dourado, tipografia centralizada. Visual mais
// "premium/estúdio", pra quem quer transmitir sofisticação.
export default function TemplateElegante({ p, preview }: PerfilTemplateProps) {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "36px 20px 48px", background: "#141414", minHeight: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        {p.fotoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.fotoUrl} alt={p.nome} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: `2px solid ${OURO}`, margin: "0 auto 16px" }} />
          : <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#262626", color: OURO, border: `2px solid ${OURO}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, margin: "0 auto 16px" }}>{iniciais(p.nome)}</div>
        }
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "#fff", letterSpacing: "0.02em", marginBottom: 6 }}>{p.nome}</h1>
        <p style={{ fontSize: 13, fontWeight: 600, color: OURO, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>{p.funcao}</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{p.cidade} · {p.estado}</p>
        {p.instagram && (
          <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, fontSize: 12, color: OURO, textDecoration: "none", letterSpacing: "0.04em" }}>
            @{p.instagram}
          </a>
        )}
        <div style={{ width: 40, height: 1, background: OURO, margin: "20px auto 0" }} />
      </div>

      {(p.apresentacao || preview) && (
        <EleganteSection titulo="Sobre">
          <p style={{ fontSize: 14, color: p.apresentacao ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)", lineHeight: 1.8, whiteSpace: "pre-wrap", textAlign: "center", fontStyle: p.apresentacao ? "normal" : "italic" }}>
            {p.apresentacao || "Conte um pouco sobre você aqui — sua experiência, seu estilo de trabalho, o que te diferencia."}
          </p>
        </EleganteSection>
      )}

      {[
        { label: "Experiência", value: p.experiencia },
        { label: "Disponibilidade", value: p.disponibilidade },
        { label: "Tipo de vínculo", value: p.tipoVinculo },
      ].filter((r) => r.value).length > 0 && (
        <EleganteSection titulo="Informações profissionais">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            {[
              { label: "Experiência", value: p.experiencia },
              { label: "Disponibilidade", value: p.disponibilidade },
              { label: "Tipo de vínculo", value: p.tipoVinculo },
            ].filter((r) => r.value).map((r) => (
              <div key={r.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: OURO, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{r.label}</p>
                <p style={{ fontSize: 14, color: "#fff" }}>{r.value}</p>
              </div>
            ))}
          </div>
        </EleganteSection>
      )}

      {p.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
          {p.tags.map((tag) => (
            <span key={tag} style={{ border: `1px solid ${OURO}`, color: OURO, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 2, letterSpacing: "0.04em" }}>{tag.toUpperCase()}</span>
          ))}
        </div>
      )}

      {(p.portfolioUrls.length > 0 || preview) && (
        <EleganteSection titulo="Portfólio">
          {p.portfolioUrls.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
              {p.portfolioUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
              ))}
            </div>
          ) : (
            <div style={{ filter: "invert(1) brightness(0.6)" }}><PlaceholderPortfolio /></div>
          )}
        </EleganteSection>
      )}

      {p.habilidades.length > 0 && (
        <EleganteSection titulo="Especialidades">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 2 }}>
            {p.habilidades.join("  ·  ")}
          </p>
        </EleganteSection>
      )}

      {p.experienciaProf.length > 0 && (
        <EleganteSection titulo="Experiência">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            {p.experienciaProf.map((exp, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{exp.cargo}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
          </div>
        </EleganteSection>
      )}

      {p.educacao.length > 0 && (
        <EleganteSection titulo="Formação">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            {p.educacao.map((edu, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{edu.curso}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
          </div>
        </EleganteSection>
      )}
    </main>
  );
}

function EleganteSection({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: OURO, textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center", marginBottom: 14 }}>{titulo}</p>
      {children}
    </div>
  );
}
