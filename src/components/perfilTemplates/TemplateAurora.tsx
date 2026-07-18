import { PerfilTemplateProps, iniciais } from "./types";

// Tema PRO — "vitrine solar": gradiente vibrante inspirado em pôr do sol,
// tags em formato de sticker, portfólio em cartões levemente inclinados.
// Pensado pra quem quer um perfil alegre e chamativo (manicure, maquiagem,
// designer de sobrancelha) — o oposto do Elegante, que é mais sóbrio.
export default function TemplateAurora({ p, preview, contatosBloqueados }: PerfilTemplateProps) {
  return (
    <main style={{
      maxWidth: 480, margin: "0 auto", padding: "0 0 48px",
      background: "linear-gradient(180deg, #fff4e8 0%, #fff9f2 30%, #fdf6ff 100%)",
    }}>
      {/* Header gradiente com foto em anel de brilho */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B9D 0%, #FF9A6B 45%, #FFC96B 100%)",
        padding: "40px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
        <div style={{ position: "absolute", bottom: -40, right: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />

        <span style={{
          display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
          color: "#fff", background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.4)",
          padding: "4px 12px", borderRadius: 999, marginBottom: 20,
        }}>
          ✦ PERFIL PRO
        </span>

        <div style={{
          width: 128, height: 128, margin: "0 auto 18px", borderRadius: "50%",
          background: "conic-gradient(from 180deg, #fff, #ffe9c9, #fff)",
          padding: 6, position: "relative",
        }}>
          {p.fotoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={p.fotoUrl} alt={p.nome} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block", border: "3px solid #fff" }} />
            : <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#fff", color: "#FF6B9D", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38 }}>{iniciais(p.nome)}</div>
          }
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff", letterSpacing: "-0.01em", marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
          {p.nome}
        </h1>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", opacity: 0.95, marginBottom: 6 }}>{p.funcao}</p>
        <p style={{ fontSize: 12, color: "#fff", opacity: 0.85, fontWeight: 600 }}>
          📍 {[p.bairro, p.cidade].filter(Boolean).join(", ")} · {p.estado}
        </p>
      </div>

      {/* Contatos — flutuam sobre a curva do header, mesmo padrão de destaque das outras PRO.
          position: relative é necessário aqui: o header logo acima é position:relative (por
          causa dos círculos decorativos absolutos), o que já basta pra ele pintar numa camada
          acima de irmãos estáticos seguintes — sem isso, o texto destes botões ficava coberto
          pela cauda do gradiente do header. */}
      {(p.whatsapp || p.instagram || p.email || contatosBloqueados) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 20px", marginTop: -28, marginBottom: 24, position: "relative", zIndex: 1 }}>
          {p.whatsapp ? (
            <a href={`https://wa.me/55${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 7, height: 44, padding: "0 20px", borderRadius: 999,
              background: "#25d366", color: "#fff", fontSize: 13, fontWeight: 800, textDecoration: "none",
              boxShadow: "0 8px 20px rgba(37,211,102,0.35)",
            }}>
              <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: 18 }}></i> WhatsApp
            </a>
          ) : contatosBloqueados && (
            <ContatoBloqueadoAurora label="WhatsApp" icone="ph-fill ph-whatsapp-logo" />
          )}
          {p.instagram && (
            <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 7, height: 44, padding: "0 20px", borderRadius: 999,
              background: "#fff", color: "#FF6B9D", fontSize: 13, fontWeight: 800, textDecoration: "none",
              boxShadow: "0 8px 20px rgba(255,107,157,0.25)",
            }}>
              <i className="ph-fill ph-instagram-logo" style={{ fontSize: 18 }}></i> @{p.instagram}
            </a>
          )}
          {p.email ? (
            <a href={`mailto:${p.email}`} style={{
              display: "inline-flex", alignItems: "center", gap: 7, height: 44, padding: "0 20px", borderRadius: 999,
              background: "#fff", border: "1.5px solid #ffd9b0", color: "#c96a2e", fontSize: 13, fontWeight: 800, textDecoration: "none",
            }}>
              <i className="ph-fill ph-envelope-simple" style={{ fontSize: 18 }}></i> Email
            </a>
          ) : contatosBloqueados && (
            <ContatoBloqueadoAurora label="Email" icone="ph-fill ph-envelope-simple" />
          )}
        </div>
      )}

      {/* Tags estilo sticker */}
      {p.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 20px", marginBottom: 28 }}>
          {p.tags.map((tag, i) => (
            <span key={tag} style={{
              background: i % 2 === 0 ? "#FFE1EC" : "#FFEBD6", color: i % 2 === 0 ? "#c9376f" : "#c9722e",
              fontSize: 12, fontWeight: 800, padding: "6px 15px", borderRadius: 999,
              transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`, display: "inline-block",
            }}>{tag}</span>
          ))}
        </div>
      )}

      <div style={{ padding: "0 20px" }}>
        {(p.apresentacao || preview) && (
          <CardAurora cor="#FF6B9D">
            <TituloAurora cor="#c9376f">Sobre {p.nome.split(" ")[0]}</TituloAurora>
            <p style={{ fontSize: 14, color: p.apresentacao ? "#5c4a52" : "#c2a3ae", lineHeight: 1.7, whiteSpace: "pre-wrap", fontStyle: p.apresentacao ? "normal" : "italic" }}>
              {p.apresentacao || "Conte um pouco sobre você aqui — sua experiência, seu estilo de trabalho, o que te diferencia."}
            </p>
          </CardAurora>
        )}

        {/* Portfólio em cartões levemente inclinados, tipo mural de fotos */}
        {(p.portfolioUrls.length > 0 || preview) && (
          <CardAurora cor="#FF9A6B">
            <TituloAurora cor="#c9722e">Meus trabalhos</TituloAurora>
            {p.portfolioUrls.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, paddingTop: 4 }}>
                {p.portfolioUrls.map((url, i) => (
                  <div key={i} style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`, background: "#fff", padding: 5, borderRadius: 12, boxShadow: "0 6px 16px rgba(255,107,157,0.15)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, display: "block" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, paddingTop: 4 }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{
                    aspectRatio: "1", borderRadius: 12, background: "linear-gradient(135deg, #ffe9e0, #fff2e2)",
                    border: "1.5px dashed #ffc9a8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                    transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                  }}>📸</div>
                ))}
                <p style={{ gridColumn: "1 / -1", fontSize: 12, color: "#c9a37e", textAlign: "center", fontStyle: "italic" }}>
                  Suas fotos de trabalho aparecem aqui, em destaque
                </p>
              </div>
            )}
          </CardAurora>
        )}

        {p.habilidades.length > 0 && (
          <CardAurora cor="#c179e0">
            <TituloAurora cor="#9333c9">Especialidades</TituloAurora>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.habilidades.map((h) => (
                <span key={h} style={{ background: "#f6e9ff", color: "#9333c9", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999 }}>{h}</span>
              ))}
            </div>
          </CardAurora>
        )}

        {(p.experienciaProf.length > 0 || preview) && (
          <CardAurora cor="#FF6B9D">
            <TituloAurora cor="#c9376f">Onde já trabalhei</TituloAurora>
            {p.experienciaProf.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {p.experienciaProf.map((exp, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 15 }}>💇</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#4a3b42" }}>{exp.cargo}</p>
                      <p style={{ fontSize: 13, color: "#9b8189" }}>{[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#c2a3ae", fontStyle: "italic" }}>
                Adicione suas experiências no perfil — elas aparecem aqui como sua trajetória profissional.
              </p>
            )}
          </CardAurora>
        )}

        {(p.educacao.length > 0 || preview) && (
          <CardAurora cor="#FF9A6B">
            <TituloAurora cor="#c9722e">Formação e cursos</TituloAurora>
            {p.educacao.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {p.educacao.map((edu, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 15 }}>🎓</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#4a3b42" }}>{edu.curso}</p>
                      <p style={{ fontSize: 13, color: "#9b8189" }}>{[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#c2a3ae", fontStyle: "italic" }}>
                Adicione seus cursos no perfil — formação passa confiança pra quem contrata.
              </p>
            )}
          </CardAurora>
        )}
      </div>
    </main>
  );
}

function CardAurora({ cor, children }: { cor: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: 20, marginBottom: 14,
      boxShadow: "0 6px 20px rgba(255,107,157,0.08)", borderTop: `3px solid ${cor}`,
    }}>
      {children}
    </div>
  );
}

function TituloAurora({ cor, children }: { cor: string; children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: cor, marginBottom: 12 }}>{children}</p>
  );
}

// Teaser do que o plano PRO desbloqueia — aparece só no preview de quem
// ainda não é PRO, no lugar do botão de contato real
function ContatoBloqueadoAurora({ label, icone }: { label: string; icone: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7, height: 44, padding: "0 20px", borderRadius: 999,
      background: "#fff", color: "#c2637e", fontSize: 13, fontWeight: 800, boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    }}>
      <i className="ph ph-lock-simple" style={{ fontSize: 16 }}></i>
      <i className={icone} style={{ fontSize: 18, opacity: 0.6 }}></i> {label}
    </span>
  );
}
