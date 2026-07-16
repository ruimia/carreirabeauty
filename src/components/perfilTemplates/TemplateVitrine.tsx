import { PerfilTemplateProps, iniciais } from "./types";

// Tema PRO — "página de marca própria": header curvo com foto sobreposta,
// nome tratado como logomarca, portfólio em mosaico estilo feed do Instagram.
export default function TemplateVitrine({ p, preview }: PerfilTemplateProps) {
  const primeiroNome = p.nome.split(" ")[0] || p.nome;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 48px", background: "#fdf8fb" }}>

      {/* Header curvo com foto sobreposta saindo do banner */}
      <div style={{ position: "relative", marginBottom: 64 }}>
        <div style={{
          background: "linear-gradient(160deg, #DC00DC 0%, #8b008b 55%, #5c005c 100%)",
          height: 170, borderBottomLeftRadius: "50% 32px", borderBottomRightRadius: "50% 32px",
          position: "relative", overflow: "hidden",
        }}>
          {/* brilho decorativo */}
          <div style={{ position: "absolute", top: -50, right: -40, width: 190, height: 190, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", top: 60, left: -60, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />

          {/* selo PRO */}
          <span style={{
            position: "absolute", top: 14, right: 16,
            fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
            color: "#fff", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)",
            padding: "4px 10px", borderRadius: 999,
          }}>
            ✦ PERFIL PRO
          </span>
        </div>

        {/* foto sobreposta */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -52 }}>
          <div style={{
            padding: 5, borderRadius: "50%",
            background: "linear-gradient(135deg, #DC00DC, #ff8ad4, #DC00DC)",
            boxShadow: "0 8px 24px rgba(220,0,220,0.35)",
          }}>
            {p.fotoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.fotoUrl} alt={p.nome} style={{ width: 108, height: 108, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", display: "block" }} />
              : <div style={{ width: 108, height: 108, borderRadius: "50%", background: "#fff", color: "#DC00DC", border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34 }}>{iniciais(p.nome)}</div>
            }
          </div>
        </div>
      </div>

      {/* Nome como logomarca */}
      <div style={{ textAlign: "center", padding: "0 20px", marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, lineHeight: 1.15, color: "#2b1230", letterSpacing: "-0.02em", marginBottom: 6 }}>
          {p.nome}
        </h1>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#DC00DC", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
          {p.funcao}
        </p>
        <p style={{ fontSize: 13, color: "#9b7f96", fontWeight: 600 }}>📍 {[p.bairro, p.cidade].filter(Boolean).join(", ")} · {p.estado}</p>

        {/* Contatos — o "cartão de visitas" da vitrine */}
        {(p.whatsapp || p.instagram || p.email) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 18 }}>
            {p.whatsapp && (
              <a href={`https://wa.me/55${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 46, padding: "0 22px", borderRadius: 999,
                background: "linear-gradient(135deg, #25d366, #1ea952)",
                color: "#fff", fontSize: 14, fontWeight: 800, textDecoration: "none",
                boxShadow: "0 6px 18px rgba(30,169,82,0.35)",
              }}>
                <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: 19 }}></i> WhatsApp
              </a>
            )}
            {p.instagram && (
              <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 46, padding: "0 22px", borderRadius: 999,
                background: "linear-gradient(135deg, #DC00DC, #a000c8)",
                color: "#fff", fontSize: 14, fontWeight: 800, textDecoration: "none",
                boxShadow: "0 6px 18px rgba(220,0,220,0.35)",
              }}>
                <i className="ph-fill ph-instagram-logo" style={{ fontSize: 19 }}></i> @{p.instagram}
              </a>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 46, padding: "0 22px", borderRadius: 999,
                background: "#fff", border: "1.5px solid #e9a8e0",
                color: "#8b008b", fontSize: 14, fontWeight: 800, textDecoration: "none",
                boxShadow: "0 2px 10px rgba(220,0,220,0.10)",
              }}>
                <i className="ph-fill ph-envelope-simple" style={{ fontSize: 19 }}></i> Email
              </a>
            )}
          </div>
        )}
      </div>

      {/* Tags como "serviços" */}
      {p.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 20px", marginBottom: 26 }}>
          {p.tags.map((tag) => (
            <span key={tag} style={{
              background: "#fff", color: "#8b008b", fontSize: 12, fontWeight: 700,
              padding: "6px 16px", borderRadius: 999, border: "1.5px solid #f3c8ee",
              boxShadow: "0 2px 8px rgba(220,0,220,0.08)",
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Portfólio — mosaico protagonista estilo feed */}
      {(p.portfolioUrls.length > 0 || preview) && (
        <div style={{ marginBottom: 30 }}>
          <TituloVitrine>Meus trabalhos</TituloVitrine>
          {p.portfolioUrls.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, padding: "0 12px" }}>
              {p.portfolioUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" style={{
                  width: "100%", objectFit: "cover", borderRadius: 14,
                  aspectRatio: i === 0 ? "2/1.1" : "1",
                  gridColumn: i === 0 ? "1 / -1" : undefined,
                  boxShadow: "0 4px 14px rgba(43,18,48,0.12)",
                }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, padding: "0 12px" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  aspectRatio: i === 0 ? "2/1.1" : "1", gridColumn: i === 0 ? "1 / -1" : undefined,
                  borderRadius: 14, background: "linear-gradient(135deg, #fbeaf8, #f6d9f2)",
                  border: "1.5px dashed #e9a8e0",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                }}>📸</div>
              ))}
              <p style={{ gridColumn: "1 / -1", fontSize: 12, color: "#b98cb2", textAlign: "center", fontStyle: "italic", marginTop: 2 }}>
                Suas fotos de trabalho aparecem aqui, em destaque
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "0 20px" }}>
        {(p.apresentacao || preview) && (
          <CardVitrine>
            <TituloCard>Sobre {primeiroNome}</TituloCard>
            <p style={{ fontSize: 14, color: p.apresentacao ? "#5c4457" : "#b98cb2", lineHeight: 1.75, whiteSpace: "pre-wrap", fontStyle: p.apresentacao ? "normal" : "italic" }}>
              {p.apresentacao || "Conte um pouco sobre você aqui — sua experiência, seu estilo de trabalho, o que te diferencia."}
            </p>
          </CardVitrine>
        )}

        {p.habilidades.length > 0 && (
          <CardVitrine>
            <TituloCard>Especialidades</TituloCard>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.habilidades.map((h) => (
                <span key={h} style={{
                  background: "linear-gradient(135deg, #fbe4f8, #f4d0ef)", color: "#8b008b",
                  fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999,
                }}>{h}</span>
              ))}
            </div>
          </CardVitrine>
        )}

        {(p.experienciaProf.length > 0 || preview) && (
          <CardVitrine>
            <TituloCard>Onde já trabalhei</TituloCard>
            {p.experienciaProf.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {p.experienciaProf.map((exp, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC00DC", marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#2b1230" }}>{exp.cargo}</p>
                      <p style={{ fontSize: 13, color: "#9b7f96" }}>{[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#b98cb2", fontStyle: "italic" }}>
                Adicione suas experiências no perfil — elas aparecem aqui como sua trajetória profissional.
              </p>
            )}
          </CardVitrine>
        )}

        {(p.educacao.length > 0 || preview) && (
          <CardVitrine>
            <TituloCard>Formação e cursos</TituloCard>
            {p.educacao.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {p.educacao.map((edu, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 15, marginTop: 1 }}>🎓</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#2b1230" }}>{edu.curso}</p>
                      <p style={{ fontSize: 13, color: "#9b7f96" }}>{[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#b98cb2", fontStyle: "italic" }}>
                Adicione seus cursos no perfil — formação passa confiança pra quem contrata.
              </p>
            )}
          </CardVitrine>
        )}
      </div>
    </main>
  );
}

function TituloVitrine({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", marginBottom: 14 }}>
      <span style={{ flex: 1, height: 1.5, background: "linear-gradient(to right, transparent, #eab6e4)" }} />
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#8b008b", whiteSpace: "nowrap" }}>{children}</p>
      <span style={{ flex: 1, height: 1.5, background: "linear-gradient(to left, transparent, #eab6e4)" }} />
    </div>
  );
}

function CardVitrine({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, padding: 20, marginBottom: 14,
      boxShadow: "0 4px 16px rgba(43,18,48,0.07)", border: "1px solid #f7e3f4",
    }}>
      {children}
    </div>
  );
}

function TituloCard({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#8b008b", marginBottom: 12 }}>{children}</p>
  );
}
