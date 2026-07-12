export const dynamic = "force-dynamic";

export const metadata = { title: "Vagas para você" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

const VINCULO_LABEL: Record<string, string> = {
  clt: "CLT", pj: "PJ", freela: "Freela", estagio: "Estágio", menor_aprendiz: "Menor aprendiz",
};

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "var(--radius-md)",
      background: "var(--brand-blush-100)", color: "var(--brand-blush-500)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 700,
      fontSize: size * 0.35, flexShrink: 0,
    }}>
      {initials || <i className="ph-fill ph-storefront"></i>}
    </div>
  );
}

export default async function DashboardProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals").select("*").eq("user_id", user.id).maybeSingle();

  if (!professional) redirect("/onboarding/tipo");
  if (!professional.slug) redirect("/onboarding/profissional");

  const funcoes: string[] = professional.funcoes ?? [];

  const [{ data: allJobs }, { data: applications }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, titulo, funcao, funcao_outro, slug, faixa_salarial, tipo_vinculo, descricao, criado_em, companies(nome_estabelecimento, cidade, estado, logo_url)")
      .eq("status", "ativa")
      .order("criado_em", { ascending: false }),
    supabase
      .from("applications")
      .select("job_id, criado_em, jobs(titulo, funcao, funcao_outro, slug, companies(nome_estabelecimento, logo_url))")
      .eq("professional_id", professional.id)
      .order("criado_em", { ascending: false }),
  ]);

  const appliedJobIds = new Set((applications ?? []).map((a) => a.job_id));

  // Vagas compatíveis ainda não candidatadas — mesma função e mesmo estado
  const jobs = (allJobs ?? []).filter((j) => {
    if (appliedJobIds.has(j.id)) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobEstado = (j.companies as any)?.estado;
    if (professional.estado && jobEstado && jobEstado !== professional.estado) return false;
    if (funcoes.length === 0) return true;
    return funcoes.some((f) => f.toLowerCase() === j.funcao?.toLowerCase() ||
      (j.funcao === "outro" && funcoes.includes("outro")));
  });

  // Força do perfil — quanto mais completo, mais fácil empresas encontrarem
  const checks: { label: string; done: boolean }[] = [
    { label: "Foto de perfil", done: !!professional.foto_perfil_url },
    { label: "Apresentação", done: !!professional.educacao_basica },
    { label: "Habilidades", done: (professional.habilidades?.length ?? 0) > 0 },
    { label: "Formação e cursos", done: (professional.educacao?.length ?? 0) > 0 },
    { label: "Experiência profissional", done: (professional.experiencia_prof?.length ?? 0) > 0 },
    { label: "Portfólio", done: (professional.portfolio_urls?.length ?? 0) > 0 },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const perfilPct = Math.round((doneCount / checks.length) * 100);
  const faltando = checks.filter((c) => !c.done).map((c) => c.label);

  // Dicas práticas — versão em ação de cada item que falta, com ícone
  const DICA: Record<string, { texto: string; icon: string }> = {
    "Foto de perfil": { texto: "Coloque uma foto sua", icon: "ph-fill ph-camera" },
    "Apresentação": { texto: "Escreva um pouco sobre você", icon: "ph-fill ph-chat-circle-text" },
    "Habilidades": { texto: "Marque suas habilidades", icon: "ph-fill ph-star" },
    "Formação e cursos": { texto: "Adicione seus cursos", icon: "ph-fill ph-graduation-cap" },
    "Experiência profissional": { texto: "Conte sua experiência", icon: "ph-fill ph-briefcase" },
    "Portfólio": { texto: "Mostre fotos do seu trabalho", icon: "ph-fill ph-images" },
  };
  const dicas = faltando.slice(0, 3).map((label) => DICA[label]).filter(Boolean);

  return (
    <div>
      <main className="page-x">

        {/* Força do perfil */}
        {perfilPct < 100 && (
          <Link href="/dashboard/profissional/perfil" style={{
            display: "block", textDecoration: "none", marginBottom: 20,
            background: "linear-gradient(135deg, var(--color-brand-primary), var(--brand-magenta-600, #a600a6))",
            borderRadius: "var(--radius-xl)", padding: 20, boxShadow: "var(--shadow-md)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ font: "700 16px/1.3 var(--font-display)", color: "#fff" }}>
                Seu perfil está {perfilPct}% completo
              </p>
              <span style={{
                fontSize: 13, fontWeight: 800, color: "var(--color-brand-primary)",
                background: "#fff", padding: "8px 16px", borderRadius: "var(--radius-pill)",
                whiteSpace: "nowrap", flexShrink: 0, marginLeft: 12,
              }}>
                Completar →
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.3)", overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${perfilPct}%`, background: "#fff", borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
              Capricha no perfil e aumenta suas chances de ser chamada primeiro! 🚀
              Falta: {faltando.join(", ")}.
            </p>
          </Link>
        )}

        {/* Stats — só aparece quando há algo pra mostrar (placar zerado desanima) */}
        {(jobs.length > 0 || (applications?.length ?? 0) > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "var(--brand-magenta-50)", color: "var(--color-brand-primary)" }}>
                <i className="ph-fill ph-briefcase"></i>
              </div>
              <div>
                <p style={{ font: "800 28px/1 var(--font-display)", color: "var(--text-primary)" }}>{jobs.length}</p>
                <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 3 }}>Vagas para você</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "var(--brand-cyan-50)", color: "var(--brand-cyan-600)" }}>
                <i className="ph-fill ph-paper-plane-tilt"></i>
              </div>
              <div>
                <p style={{ font: "800 28px/1 var(--font-display)", color: "var(--text-primary)" }}>{applications?.length ?? 0}</p>
                <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 3 }}>Candidaturas</p>
              </div>
            </div>
          </div>
        )}

        {/* Vagas compatíveis */}
        <p className="section-label">Vagas para você</p>

        {jobs.length === 0 ? (
          <div className="card card-xl" style={{ padding: "28px 24px", textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
              background: "linear-gradient(135deg, var(--brand-magenta-100), var(--brand-cyan-100))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
            }}>
              🔍
            </div>
            <p style={{ font: "var(--text-h2)", color: "var(--text-primary)", marginBottom: 8 }}>
              Sua vaga tá chegando! 🎉
            </p>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto 14px" }}>
              A gente já tá de olho em vagas pra você
              {professional.cidade && professional.estado ? ` em ${professional.cidade} - ${professional.estado}` : " na sua região"}.
              Assim que aparecer uma, te avisamos na hora por email!
            </p>
            {funcoes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {funcoes.map((f) => (
                  <span key={f} className="tag" style={{ background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)", border: "1px solid var(--brand-cyan-100)" }}>
                    {FUNCAO_LABEL[f] ?? f}
                  </span>
                ))}
              </div>
            )}

            {dicas.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border-default)", textAlign: "left" }}>
                <p style={{ font: "700 13px/1 var(--font-display)", color: "var(--text-primary)", marginBottom: 12, textAlign: "center" }}>
                  Enquanto isso, capricha aqui pra aparecer mais 👇
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {dicas.map((dica) => (
                    <Link key={dica.texto} href="/dashboard/profissional/perfil" style={{
                      display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
                      background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "10px 14px",
                    }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: "var(--brand-magenta-50)", color: "var(--color-brand-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                      }}>
                        <i className={dica.icon}></i>
                      </span>
                      <span style={{ font: "600 13px/1.3 var(--font-body)", color: "var(--text-primary)" }}>{dica.texto}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 12 }}>
              <Link href="/dashboard/profissional/perfil" style={{ color: "var(--color-brand-primary)", fontWeight: 600 }}>
                Editar especialidades
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {jobs.map((job) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const company = job.companies as any;
              const title = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);

              return (
                <Link key={job.id} href={`/vaga/${job.slug}`} style={{ textDecoration: "none" }}>
                  <div className="job-feed-card">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ font: "500 11px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                          {company?.nome_estabelecimento}
                          {company?.cidade ? ` · ${company.cidade}, ${company.estado}` : ""}
                        </p>
                        <p style={{ font: "600 17px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                          {job.titulo || title}
                        </p>
                      </div>
                      {job.faixa_salarial && (
                        <span className="chip" style={{ background: "var(--brand-magenta-50)", color: "var(--brand-magenta-700)", flexShrink: 0 }}>
                          <i className="ph ph-currency-circle-dollar"></i> {job.faixa_salarial}
                        </span>
                      )}
                    </div>

                    {job.descricao && (
                      <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.descricao}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                      {job.tipo_vinculo && (
                        <span className="tag"><i className="ph ph-briefcase"></i> {VINCULO_LABEL[job.tipo_vinculo] ?? job.tipo_vinculo}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Minhas candidaturas */}
        {(applications?.length ?? 0) > 0 && (
          <>
            <p className="section-label" style={{ marginTop: 4 }}>Minhas candidaturas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {applications!.map((app) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const job = app.jobs as any;
                if (!job) return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const company = job.companies as any;
                const title = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);

                return (
                  <Link key={app.job_id} href={`/vaga/${job.slug}`} style={{ textDecoration: "none" }}>
                    <div className="job-feed-card" style={{ borderLeft: "3px solid var(--color-success-fg)" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {company?.logo_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={company.logo_url} alt={company.nome_estabelecimento}
                              style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                          : <Avatar name={company?.nome_estabelecimento ?? "?"} size={40} />
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ font: "600 15px/1.2 var(--font-display)", color: "var(--text-primary)" }}>
                            {job.titulo || title}
                          </p>
                          <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 2 }}>
                            {company?.nome_estabelecimento}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span className="status-pill" style={{ background: "var(--color-success-bg)", color: "var(--color-success-fg)" }}>
                            <i className="ph-fill ph-check-circle"></i> Enviada
                          </span>
                          <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 4 }}>
                            {new Date(app.criado_em).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
