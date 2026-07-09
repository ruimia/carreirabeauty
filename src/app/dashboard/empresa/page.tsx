export const metadata = { title: "Minhas vagas" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import EncerrarVagaButton from "./EncerrarVagaButton";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string; icon: string; cardClass: string }> = {
  ativa:               { bg: "var(--color-success-bg)", color: "var(--color-success-fg)", label: "Ativa",       icon: "ph-fill ph-check-circle", cardClass: "status-ativa" },
  pausada:             { bg: "var(--color-warning-bg)", color: "var(--color-warning-fg)", label: "Pausada",     icon: "ph-fill ph-pause-circle",  cardClass: "status-pausada" },
  fechada:             { bg: "var(--neutral-100)",       color: "var(--text-tertiary)",   label: "Fechada",     icon: "ph ph-x-circle",           cardClass: "status-fechada" },
  bloqueada_pos_trial: { bg: "var(--color-danger-bg)",  color: "var(--color-danger-fg)", label: "Bloqueada",   icon: "ph-fill ph-x-circle",      cardClass: "status-rejeitada" },
  pendente_moderacao:  { bg: "var(--color-warning-bg)", color: "var(--color-warning-fg)", label: "Em análise", icon: "ph-fill ph-hourglass-medium", cardClass: "status-pendente" },
  rejeitada:           { bg: "var(--color-danger-bg)",  color: "var(--color-danger-fg)", label: "Rejeitada",   icon: "ph-fill ph-x-circle",      cardClass: "status-rejeitada" },
};

export default async function DashboardEmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies").select("*").eq("user_id", user.id).maybeSingle();

  if (!company) redirect("/onboarding/tipo");
  if (company.status_cadastro !== "completo") redirect("/onboarding/empresa");

  const { data: jobs } = await supabase
    .from("jobs").select("*, applications(count)")
    .eq("company_id", company.id).order("criado_em", { ascending: false });

  const totalCandidatos = (jobs ?? []).reduce((sum, j) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sum + ((j.applications as any)?.[0]?.count ?? 0);
  }, 0);

  const todasPendentes = (jobs ?? []).length > 0 && (jobs ?? []).every((j) => j.status === "pendente_moderacao");

  return (
    <div>
      <main className="page-x">

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--brand-magenta-50)", color: "var(--color-brand-primary)" }}>
              <i className="ph-fill ph-briefcase"></i>
            </div>
            <div>
              <p style={{ font: "800 28px/1 var(--font-display)", color: "var(--text-primary)" }}>{jobs?.length ?? 0}</p>
              <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 3 }}>Vagas publicadas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--brand-cyan-50)", color: "var(--brand-cyan-600)" }}>
              <i className="ph-fill ph-users-three"></i>
            </div>
            <div>
              <p style={{ font: "800 28px/1 var(--font-display)", color: "var(--text-primary)" }}>{totalCandidatos}</p>
              <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 3 }}>Candidatos recebidos</p>
            </div>
          </div>
        </div>

        {/* Jobs list */}
        <p className="section-label">Suas vagas</p>

        {todasPendentes && (
          <div style={{
            background: "var(--color-warning-bg)", border: "1px solid var(--color-warning-border)",
            borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 14,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <i className="ph-fill ph-hourglass-medium" style={{ fontSize: 20, color: "var(--color-warning-fg)", flexShrink: 0, marginTop: 1 }}></i>
            <div>
              <p style={{ font: "var(--text-label)", color: "var(--color-warning-fg)", marginBottom: 2 }}>
                Vaga em análise
              </p>
              <p style={{ font: "var(--text-body-sm)", color: "var(--color-warning-fg)", lineHeight: 1.5 }}>
                Nossa equipe está revisando sua vaga. Você receberá um email assim que for aprovada — e outro a cada nova candidatura.
              </p>
            </div>
          </div>
        )}

        {!jobs || jobs.length === 0 ? (
          <div className="card card-xl" style={{ padding: "36px 24px", textAlign: "center" }}>
            <i className="ph ph-briefcase" style={{ fontSize: 40, color: "var(--text-tertiary)", marginBottom: 12, display: "block" }}></i>
            <p style={{ font: "var(--text-h2)", color: "var(--text-primary)", marginBottom: 8 }}>
              Publique sua primeira vaga
            </p>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto 20px" }}>
              Em minutos você começa a receber candidatos. A vaga passa por uma análise rápida antes de ser publicada.
            </p>
            <Link href="/dashboard/empresa/vagas/nova" className="btn btn-primary" style={{ margin: "0 auto" }}>
              <i className="ph-bold ph-plus"></i> Criar vaga
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {jobs.map((job) => {
              const status = STATUS_STYLE[job.status] ?? STATUS_STYLE.fechada;
              const title = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const count = (job.applications as any)?.[0]?.count ?? 0;

              const rejeitada = job.status === "rejeitada";
              const emAnalise = job.status === "pendente_moderacao";

              return (
                <div key={job.id} className={`job-card ${status.cardClass}`}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ font: "600 16px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                        {job.titulo || title}
                      </p>
                      {job.faixa_salarial && (
                        <p style={{ font: "600 13px/1.4 var(--font-body)", color: "var(--brand-cyan-700)", marginTop: 3 }}>
                          {job.faixa_salarial}
                        </p>
                      )}
                    </div>
                    <span className="status-pill" style={{ background: status.bg, color: status.color, flexShrink: 0 }}>
                      <i className={status.icon}></i> {status.label}
                    </span>
                  </div>

                  {job.tipo_vinculo && (
                    <div style={{ marginTop: 8 }}>
                      <span className="tag">{job.tipo_vinculo}</span>
                    </div>
                  )}

                  {/* Motivo de rejeição */}
                  {rejeitada && job.motivo_rejeicao && (
                    <div style={{
                      marginTop: 10, padding: "10px 12px",
                      background: "var(--color-danger-bg)", borderRadius: "var(--radius-md)",
                      borderLeft: "3px solid var(--color-danger-fg)",
                    }}>
                      <p style={{ font: "var(--text-overline)", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-danger-fg)", marginBottom: 2 }}>
                        Motivo da rejeição
                      </p>
                      <p style={{ font: "var(--text-body-sm)", color: "var(--color-danger-fg)", lineHeight: 1.5 }}>
                        {job.motivo_rejeicao}
                      </p>
                    </div>
                  )}

                  {/* Aviso em análise */}
                  {emAnalise && (
                    <p style={{ font: "var(--text-body-sm)", color: "var(--color-warning-fg)", marginTop: 10, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className="ph ph-info"></i> Aguardando aprovação — publicamos em até 1 dia útil.
                    </p>
                  )}

                  {job.descricao && !rejeitada && !emAnalise && (
                    <p style={{
                      font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {job.descricao}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ font: "var(--text-caption)", color: "var(--text-tertiary)" }}>
                        {new Date(job.criado_em).toLocaleDateString("pt-BR")}
                      </span>
                      {(job.status === "ativa" || job.status === "fechada") && (
                        <EncerrarVagaButton jobId={job.id} fechada={job.status === "fechada"} />
                      )}
                    </div>
                    {rejeitada ? (
                      <Link href={`/dashboard/empresa/vagas/${job.id}/editar`} className="icon-btn" style={{ color: "var(--color-danger-fg)" }}>
                        Editar e reenviar <i className="ph-bold ph-caret-right"></i>
                      </Link>
                    ) : job.status !== "fechada" ? (
                      <Link href={`/dashboard/empresa/vagas/${job.id}/candidatos`} className="icon-btn" style={{ color: "var(--color-brand-primary)" }}>
                        {count} candidato{count !== 1 ? "s" : ""} <i className="ph-bold ph-caret-right"></i>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/empresa/vagas/${job.id}/candidatos`} className="icon-btn" style={{ color: "var(--text-tertiary)" }}>
                        {count} candidato{count !== 1 ? "s" : ""}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

