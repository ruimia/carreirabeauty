export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

export default async function CandidatosPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("jobs")
    .select("*, companies!inner(user_id, nome_estabelecimento)")
    .eq("id", jobId).single();

  if (!job) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((job.companies as any).user_id !== user.id) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, criado_em, professionals(id, nome, telefone, funcao, funcao_outro, cidade, estado, experiencia, disponibilidade, foto_perfil_url, slug)")
    .eq("job_id", jobId)
    .order("criado_em", { ascending: false });

  const funcaoVaga = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);
  const count = applications?.length ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>

      {/* Top bar */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/dashboard/empresa" style={{ color: "var(--text-tertiary)", fontSize: 22, lineHeight: 1, textDecoration: "none" }}>
          ←
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {funcaoVaga}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            {count} candidato{count !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px var(--space-page-x)" }}>

        {count === 0 ? (
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-sm)", padding: "48px 24px", textAlign: "center",
          }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>👀</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
              Nenhum candidato ainda
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Os candidatos aparecem aqui assim que se aplicam à vaga.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applications!.map((app) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = app.professionals as any;
              if (!p) return null;

              const funcao = p.funcao === "outro" ? (p.funcao_outro || "Outro") : (FUNCAO_LABEL[p.funcao] ?? p.funcao);
              const initials = p.nome?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() ?? "?";
              const whatsapp = p.telefone?.replace(/\D/g, "");
              const whatsappUrl = whatsapp
                ? `https://wa.me/55${whatsapp}?text=${encodeURIComponent(`Olá ${p.nome}, vi sua candidatura no CarreiraBeauty para a vaga de ${funcaoVaga}!`)}`
                : null;

              return (
                <div key={app.id} style={{
                  background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)", padding: 16,
                }}>
                  {/* Top: avatar + info */}
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {p.foto_perfil_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.foto_perfil_url} alt={p.nome}
                          style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      : (
                        <div style={{
                          width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                          background: "var(--brand-cyan-50)", color: "var(--brand-cyan-600)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20,
                        }}>
                          {initials}
                        </div>
                      )
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
                        {p.nome}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-primary)", marginTop: 1 }}>
                        {funcao}
                      </p>
                      {p.cidade && (
                        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                          📍 {p.cidade} · {p.estado}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {(p.experiencia || p.disponibilidade) && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                      {p.experiencia && (
                        <span style={{
                          background: "var(--neutral-100)", color: "var(--text-secondary)",
                          fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--radius-pill)",
                        }}>
                          ⏱ {p.experiencia}
                        </span>
                      )}
                      {p.disponibilidade && (
                        <span style={{
                          background: "var(--neutral-100)", color: "var(--text-secondary)",
                          fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--radius-pill)",
                        }}>
                          📅 {p.disponibilidade}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    {p.slug && (
                      <Link href={`/perfil/${p.slug}`} style={{
                        flex: 1, height: 40, borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-default)", background: "var(--surface-card)",
                        color: "var(--text-primary)", fontFamily: "var(--font-body)", fontWeight: 600,
                        fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                        textDecoration: "none",
                      }}>
                        Ver perfil
                      </Link>
                    )}
                    {whatsappUrl && (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1, height: 40, borderRadius: "var(--radius-pill)",
                        background: "#25D366", color: "#fff",
                        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        textDecoration: "none", gap: 6,
                      }}>
                        <span style={{ fontSize: 15 }}>💬</span> WhatsApp
                      </a>
                    )}
                  </div>

                  <p style={{ fontSize: 11, color: "var(--neutral-400)", marginTop: 10 }}>
                    Candidatou-se em {new Date(app.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
