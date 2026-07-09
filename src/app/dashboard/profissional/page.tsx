export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

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
      {initials || "🏪"}
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

  // Vagas compatíveis ainda não candidatadas
  const jobs = (allJobs ?? []).filter((j) => {
    if (appliedJobIds.has(j.id)) return false;
    if (funcoes.length === 0) return true;
    return funcoes.some((f) => f.toLowerCase() === j.funcao?.toLowerCase() ||
      (j.funcao === "outro" && funcoes.includes("outro")));
  });

  const funcaoLabel = professional.funcao === "outro"
    ? (professional.funcao_outro || "Outro")
    : (FUNCAO_LABEL[professional.funcao] ?? professional.funcao);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-square.jpg" alt="CarreiraBeauty" style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", objectFit: "cover" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {professional.nome}
          </p>
          <p style={{ fontSize: 12, color: "var(--color-brand-primary)", fontWeight: 600 }}>{funcaoLabel}</p>
        </div>
        <Link href="/dashboard/profissional/perfil" style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
          Perfil
        </Link>
        <Link href="/dashboard/profissional/planos" style={{ fontSize: 13, fontWeight: 700, color: "var(--color-brand-primary)", textDecoration: "none", whiteSpace: "nowrap" }}>
          Planos
        </Link>
        <a href="https://wa.me/5511987049210?text=Ol%C3%A1%2C+preciso+de+suporte+no+CarreiraBeauty" target="_blank" rel="noopener noreferrer" style={{
          fontSize: 20, color: "#25D366", textDecoration: "none", lineHeight: 1, flexShrink: 0,
        }} title="Suporte WhatsApp">
          💬
        </a>
        <LogoutButton compact />
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: "20px var(--space-page-x)", maxWidth: 480, width: "100%", margin: "0 auto" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Vagas para você", value: jobs.length, color: "var(--color-brand-primary)" },
            { label: "Candidaturas enviadas", value: applications?.length ?? 0, color: "var(--color-brand-secondary)" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)", padding: 16,
              boxShadow: "var(--shadow-xs)",
            }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: s.color, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Vagas compatíveis */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Vagas para você
        </p>

        {jobs.length === 0 ? (
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
            padding: "28px 24px", textAlign: "center", marginBottom: 28,
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✉️</div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
              Seu perfil está ativo
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 300, margin: "0 auto 14px" }}>
              Assim que uma vaga compatível com suas especialidades for publicada, você receberá um email.
            </p>
            {funcoes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {funcoes.map((f) => (
                  <span key={f} style={{
                    background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)",
                    fontSize: 12, fontWeight: 600, padding: "4px 12px",
                    borderRadius: "var(--radius-pill)", border: "1px solid var(--brand-cyan-100)",
                  }}>
                    {FUNCAO_LABEL[f] ?? f}
                  </span>
                ))}
              </div>
            )}
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12 }}>
              <Link href="/dashboard/profissional/perfil" style={{ color: "var(--color-brand-primary)", fontWeight: 600, textDecoration: "none" }}>
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
                  <div style={{
                    background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-xs)", border: "1px solid var(--border-default)",
                    padding: 16,
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      {company?.logo_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={company.logo_url} alt={company.nome_estabelecimento}
                            style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                        : <Avatar name={company?.nome_estabelecimento ?? "?"} />
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.25 }}>
                          {job.titulo || title}
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {company?.nome_estabelecimento}
                        </p>
                        {company?.cidade && (
                          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>
                            📍 {company.cidade} · {company.estado}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 18, color: "var(--text-tertiary)", alignSelf: "center" }}>›</span>
                    </div>

                    {job.descricao && (
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.descricao}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                      {job.tipo_vinculo && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-pill)", background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)", border: "1px solid var(--brand-cyan-100)" }}>
                          {VINCULO_LABEL[job.tipo_vinculo] ?? job.tipo_vinculo}
                        </span>
                      )}
                      {job.faixa_salarial && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-pill)", background: "var(--brand-magenta-50)", color: "var(--brand-magenta-700)" }}>
                          {job.faixa_salarial}
                        </span>
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
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Minhas candidaturas
            </p>
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
                    <div style={{
                      background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-success-border, #BBF7D0)",
                      boxShadow: "var(--shadow-xs)", padding: "14px 16px",
                      display: "flex", gap: 12, alignItems: "center",
                    }}>
                      {company?.logo_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={company.logo_url} alt={company.nome_estabelecimento}
                            style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                        : <Avatar name={company?.nome_estabelecimento ?? "?"} size={40} />
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.2 }}>
                          {job.titulo || title}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                          {company?.nome_estabelecimento}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-pill)",
                          background: "var(--color-success-bg)", color: "var(--color-success-fg)",
                          display: "inline-block",
                        }}>
                          ✓ Enviada
                        </span>
                        <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
                          {new Date(app.criado_em).toLocaleDateString("pt-BR")}
                        </p>
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
