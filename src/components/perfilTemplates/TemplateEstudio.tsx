import { PerfilTemplateProps, iniciais } from "./types";

const TINTA = "#26221f";
const AREIA = "#f4efe8";
const LINHA = "#e3dbcf";

// Tema PRO — "editorial de estúdio": portfólio vira capa de revista logo no
// topo, tipografia bold sem serifa, paleta neutra areia/tinta. Pensado pra
// quem quer que o trabalho (fotos) fale antes de qualquer texto — esteticista,
// designer de sobrancelha/cílios, maquiador(a).
export default function TemplateEstudio({ p, preview }: PerfilTemplateProps) {
  const capa = p.portfolioUrls[0];
  const resto = p.portfolioUrls.slice(1);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 48px", background: AREIA }}>
      {/* Capa — primeira foto do portfólio vira banner, nome sobreposto */}
      <div style={{ position: "relative", height: 260, background: TINTA, overflow: "hidden" }}>
        {capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capa} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
        ) : preview ? (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.4 }}>📸</div>
        ) : null}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(38,34,31,0.1) 0%, rgba(38,34,31,0.85) 100%)" }} />

        <span style={{
          position: "absolute", top: 16, right: 16,
          fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
          color: "#fff", border: "1px solid rgba(255,255,255,0.5)", padding: "4px 10px",
        }}>
          ✦ PERFIL PRO
        </span>

        <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#e3dbcf", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6, fontFamily: "var(--font-body)" }}>
            {p.funcao}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            {p.nome}
          </h1>
        </div>
      </div>

      {/* Faixa de identidade — foto de perfil pequena + localização + contatos, estilo crédito de revista */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: `1px solid ${LINHA}` }}>
        {p.fotoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.fotoUrl} alt={p.nome} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 44, height: 44, borderRadius: "50%", background: TINTA, color: AREIA, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{iniciais(p.nome)}</div>
        }
        <p style={{ fontSize: 12, color: "#6b6259", fontWeight: 600, flex: 1 }}>
          📍 {[p.bairro, p.cidade].filter(Boolean).join(", ")} · {p.estado}
        </p>
      </div>

      {(p.whatsapp || p.instagram || p.email) && (
        <div style={{ display: "flex", gap: 8, padding: "16px 24px 0", flexWrap: "wrap" }}>
          {p.whatsapp && (
            <a href={`https://wa.me/55${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 7, height: 42, padding: "0 18px",
              background: TINTA, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: 16 }}></i> WhatsApp
            </a>
          )}
          {p.instagram && (
            <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 7, height: 42, padding: "0 18px",
              border: `1.5px solid ${TINTA}`, color: TINTA, fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              <i className="ph-fill ph-instagram-logo" style={{ fontSize: 16 }}></i> @{p.instagram}
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} style={{
              display: "inline-flex", alignItems: "center", gap: 7, height: 42, padding: "0 18px",
              border: `1px solid ${LINHA}`, color: "#6b6259", fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              <i className="ph-fill ph-envelope-simple" style={{ fontSize: 16 }}></i> Email
            </a>
          )}
        </div>
      )}

      {p.tags.length > 0 && (
        <p style={{ padding: "16px 24px 0", fontSize: 13, color: "#6b6259", fontWeight: 600 }}>
          {p.tags.join("  ／  ")}
        </p>
      )}

      {(p.apresentacao || preview) && (
        <Secao numero="01" titulo="Sobre">
          <p style={{ fontSize: 15, color: p.apresentacao ? "#3d3833" : "#a99f92", lineHeight: 1.8, whiteSpace: "pre-wrap", fontStyle: p.apresentacao ? "normal" : "italic" }}>
            {p.apresentacao || "Conte um pouco sobre você aqui — sua experiência, seu estilo de trabalho, o que te diferencia."}
          </p>
        </Secao>
      )}

      {/* Restante do portfólio — grade editorial, a capa já usou a primeira foto */}
      {(resto.length > 0 || (preview && p.portfolioUrls.length === 0)) && (
        <Secao numero="02" titulo="Portfólio">
          {resto.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
              {resto.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ aspectRatio: "1", background: "#eae3d8", border: `1px dashed ${LINHA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#a99f92" }}>🖼️</div>
              ))}
              <p style={{ gridColumn: "1 / -1", fontSize: 12, color: "#a99f92", fontStyle: "italic", marginTop: 4 }}>
                Suas fotos de trabalho compõem a grade — a primeira vira a capa do perfil
              </p>
            </div>
          )}
        </Secao>
      )}

      {p.habilidades.length > 0 && (
        <Secao numero="03" titulo="Especialidades">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {p.habilidades.map((h) => (
              <span key={h} style={{ border: `1px solid ${TINTA}`, color: TINTA, fontSize: 12, fontWeight: 700, padding: "6px 14px" }}>{h}</span>
            ))}
          </div>
        </Secao>
      )}

      {(p.experienciaProf.length > 0 || preview) && (
        <Secao numero="04" titulo="Trajetória">
          {p.experienciaProf.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {p.experienciaProf.map((exp, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: i < p.experienciaProf.length - 1 ? `1px solid ${LINHA}` : "none", paddingBottom: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: TINTA }}>{exp.cargo}</p>
                  <p style={{ fontSize: 12, color: "#8a8074", textAlign: "right", flexShrink: 0 }}>{[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#a99f92", fontStyle: "italic" }}>
              Adicione suas experiências no perfil — elas aparecem aqui como sua trajetória.
            </p>
          )}
        </Secao>
      )}

      {(p.educacao.length > 0 || preview) && (
        <Secao numero="05" titulo="Formação">
          {p.educacao.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {p.educacao.map((edu, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: i < p.educacao.length - 1 ? `1px solid ${LINHA}` : "none", paddingBottom: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: TINTA }}>{edu.curso}</p>
                  <p style={{ fontSize: 12, color: "#8a8074", textAlign: "right", flexShrink: 0 }}>{[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#a99f92", fontStyle: "italic" }}>
              Adicione seus cursos no perfil — formação passa confiança pra quem contrata.
            </p>
          )}
        </Secao>
      )}
    </main>
  );
}

function Secao({ numero, titulo, children }: { numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "26px 24px", borderBottom: `1px solid ${LINHA}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#a99f92", fontFamily: "var(--font-body)" }}>{numero}</span>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: TINTA, textTransform: "uppercase", letterSpacing: "0.14em" }}>{titulo}</p>
      </div>
      {children}
    </div>
  );
}
