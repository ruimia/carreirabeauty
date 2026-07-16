import { PerfilTemplateProps, iniciais } from "./types";

const OURO = "#d4af5f";
const OURO_CLARO = "#ecd9ab";
const FUNDO = "#111013";
const CARTAO = "#1b191e";

// Tema PRO — "estúdio de luxo": monograma dourado, tipografia serifada,
// divisores ornamentais, portfólio em moldura. Sofisticação de marca própria.
export default function TemplateElegante({ p, preview }: PerfilTemplateProps) {
  const monograma = iniciais(p.nome);

  return (
    <main style={{
      maxWidth: 480, margin: "0 auto", padding: "0 0 48px",
      background: `radial-gradient(circle at 50% -10%, #292430 0%, ${FUNDO} 45%)`,
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>

      {/* Cabeçalho — monograma + foto emoldurada */}
      <div style={{ textAlign: "center", padding: "44px 24px 0", position: "relative" }}>
        <span style={{
          position: "absolute", top: 16, right: 16,
          fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
          color: OURO, border: `1px solid ${OURO}55`, padding: "4px 10px", borderRadius: 2,
        }}>
          ✦ PERFIL PRO
        </span>

        {/* monograma */}
        <div style={{
          width: 54, height: 54, margin: "0 auto 22px", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, border: `1px solid ${OURO}`, transform: "rotate(45deg)" }} />
          <span style={{ fontSize: 20, color: OURO, letterSpacing: "0.05em" }}>{monograma}</span>
        </div>

        {/* foto com moldura dupla */}
        <div style={{ display: "inline-block", padding: 8, border: `1px solid ${OURO}44`, borderRadius: "50%", marginBottom: 20 }}>
          <div style={{ padding: 3, border: `1.5px solid ${OURO}`, borderRadius: "50%" }}>
            {p.fotoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.fotoUrl} alt={p.nome} style={{ width: 112, height: 112, borderRadius: "50%", objectFit: "cover", display: "block", filter: "saturate(0.92)" }} />
              : <div style={{ width: 112, height: 112, borderRadius: "50%", background: CARTAO, color: OURO, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{monograma}</div>
            }
          </div>
        </div>

        <h1 style={{ fontWeight: 400, fontSize: 30, lineHeight: 1.2, color: "#f5efe4", letterSpacing: "0.02em", marginBottom: 10 }}>
          {p.nome}
        </h1>

        <Ornamento />

        <p style={{ fontSize: 12, fontWeight: 600, color: OURO, textTransform: "uppercase", letterSpacing: "0.28em", margin: "14px 0 8px", fontFamily: "var(--font-body)" }}>
          {p.funcao}
        </p>
        <p style={{ fontSize: 13, color: "#8d8694", letterSpacing: "0.06em", fontStyle: "italic" }}>{p.cidade} — {p.estado}</p>

        {/* Contatos */}
        {(p.whatsapp || p.instagram || p.email) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 22 }}>
            {p.whatsapp && (
              <a href={`https://wa.me/55${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 44, padding: "0 24px", borderRadius: 2,
                background: OURO, color: "#191410",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textDecoration: "none",
                textTransform: "uppercase", fontFamily: "var(--font-body)",
              }}>
                <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: 17 }}></i> WhatsApp
              </a>
            )}
            {p.instagram && (
              <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 44, padding: "0 24px", borderRadius: 2,
                border: `1px solid ${OURO}`, color: OURO_CLARO,
                fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textDecoration: "none",
                textTransform: "uppercase", fontFamily: "var(--font-body)",
              }}>
                <i className="ph-fill ph-instagram-logo" style={{ fontSize: 17 }}></i> @{p.instagram}
              </a>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 44, padding: "0 24px", borderRadius: 2,
                border: `1px solid ${OURO}55`, color: "#b9b1a4",
                fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textDecoration: "none",
                textTransform: "uppercase", fontFamily: "var(--font-body)",
              }}>
                <i className="ph-fill ph-envelope-simple" style={{ fontSize: 17 }}></i> Email
              </a>
            )}
          </div>
        )}
      </div>

      {(p.apresentacao || preview) && (
        <div style={{ padding: "36px 32px 0", textAlign: "center" }}>
          <span style={{ fontSize: 34, color: OURO, lineHeight: 0.4, display: "block", marginBottom: 10 }}>“</span>
          <p style={{ fontSize: 15, color: p.apresentacao ? "#cfc8bd" : "#6f6878", lineHeight: 1.9, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
            {p.apresentacao || "Conte um pouco sobre você aqui — sua experiência, seu estilo de trabalho, o que te diferencia."}
          </p>
        </div>
      )}

      {/* Portfólio emoldurado */}
      {(p.portfolioUrls.length > 0 || preview) && (
        <SecaoElegante titulo="Portfólio">
          {p.portfolioUrls.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, padding: "0 24px" }}>
              {p.portfolioUrls.map((url, i) => (
                <div key={i} style={{ padding: 4, border: `1px solid ${OURO}33`, gridColumn: i === 0 ? "1 / -1" : undefined }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" style={{ width: "100%", aspectRatio: i === 0 ? "2/1.2" : "1", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, padding: "0 24px" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  padding: 4, border: `1px dashed ${OURO}44`, gridColumn: i === 0 ? "1 / -1" : undefined,
                }}>
                  <div style={{ aspectRatio: i === 0 ? "2/1.2" : "1", background: CARTAO, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, opacity: 0.7 }}>🖼️</div>
                </div>
              ))}
              <p style={{ gridColumn: "1 / -1", fontSize: 12, color: "#6f6878", textAlign: "center", fontStyle: "italic" }}>
                Suas fotos de trabalho, apresentadas como uma galeria
              </p>
            </div>
          )}
        </SecaoElegante>
      )}

      {p.habilidades.length > 0 && (
        <SecaoElegante titulo="Especialidades">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 8px", justifyContent: "center", padding: "0 24px" }}>
            {p.habilidades.map((h) => (
              <span key={h} style={{
                fontSize: 12, color: OURO_CLARO, padding: "7px 16px",
                border: `1px solid ${OURO}44`, borderRadius: 2, letterSpacing: "0.06em",
                fontFamily: "var(--font-body)",
              }}>{h}</span>
            ))}
          </div>
        </SecaoElegante>
      )}

      {(p.experienciaProf.length > 0 || preview) && (
        <SecaoElegante titulo="Trajetória">
          <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 32px", textAlign: "center" }}>
            {p.experienciaProf.length > 0 ? p.experienciaProf.map((exp, i) => (
              <div key={i}>
                <p style={{ fontSize: 16, color: "#f0e9dc", marginBottom: 3 }}>{exp.cargo}</p>
                <p style={{ fontSize: 12, color: "#8d8694", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-body)" }}>
                  {[exp.empresa, exp.periodo].filter(Boolean).join("  ·  ")}
                </p>
              </div>
            )) : (
              <p style={{ fontSize: 13, color: "#6f6878", fontStyle: "italic" }}>
                Adicione suas experiências no perfil — elas aparecem aqui como sua trajetória.
              </p>
            )}
          </div>
        </SecaoElegante>
      )}

      {(p.educacao.length > 0 || preview) && (
        <SecaoElegante titulo="Formação">
          <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 32px", textAlign: "center" }}>
            {p.educacao.length > 0 ? p.educacao.map((edu, i) => (
              <div key={i}>
                <p style={{ fontSize: 16, color: "#f0e9dc", marginBottom: 3 }}>{edu.curso}</p>
                <p style={{ fontSize: 12, color: "#8d8694", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-body)" }}>
                  {[edu.instituicao, edu.ano].filter(Boolean).join("  ·  ")}
                </p>
              </div>
            )) : (
              <p style={{ fontSize: 13, color: "#6f6878", fontStyle: "italic" }}>
                Adicione seus cursos no perfil — formação passa confiança.
              </p>
            )}
          </div>
        </SecaoElegante>
      )}

      {/* fecho ornamental */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Ornamento />
      </div>
    </main>
  );
}

function Ornamento() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <span style={{ width: 44, height: 1, background: `linear-gradient(to right, transparent, ${OURO})` }} />
      <span style={{ width: 5, height: 5, background: OURO, transform: "rotate(45deg)" }} />
      <span style={{ width: 44, height: 1, background: `linear-gradient(to left, transparent, ${OURO})` }} />
    </div>
  );
}

function SecaoElegante({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: OURO, textTransform: "uppercase", letterSpacing: "0.32em", marginBottom: 10, fontFamily: "var(--font-body)" }}>{titulo}</p>
        <Ornamento />
      </div>
      {children}
    </div>
  );
}
