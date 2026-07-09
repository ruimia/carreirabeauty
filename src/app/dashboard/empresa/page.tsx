import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";
import EncerrarVagaButton from "./EncerrarVagaButton";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ativa:                { bg: "var(--color-success-bg)",  color: "var(--color-success-fg)",  label: "Ativa" },
  pausada:              { bg: "var(--color-warning-bg)",  color: "var(--color-warning-fg)",  label: "Pausada" },
  fechada:              { bg: "var(--neutral-100)",        color: "var(--text-tertiary)",     label: "Fechada" },
  bloqueada_pos_trial:  { bg: "var(--color-danger-bg)",   color: "var(--color-danger-fg)",   label: "Bloqueada" },
  pendente_moderacao:   { bg: "#FFF7ED",                  color: "#C2410C",                  label: "Em análise" },
  rejeitada:            { bg: "var(--color-danger-bg)",   color: "var(--color-danger-fg)",   label: "Rejeitada" },
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
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        {company.logo_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={company.logo_url} alt="Logo" style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }} />
          // eslint-disable-next-line @next/next/no-img-element
          : <img src="/logo-square.jpg" alt="CarreiraBeauty" style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }} />
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
            {company.nome_estabelecimento}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{company.cidade} · {company.estado}</p>
        </div>
        <Link href="/dashboard/empresa/perfil" style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
          Perfil
        </Link>
        <Link href="/dashboard/empresa/planos" style={{ fontSize: 13, fontWeight: 700, color: "var(--color-brand-primary)", textDecoration: "none", whiteSpace: "nowrap" }}>
          Planos
        </Link>
        <a href="https://wa.me/5511987049210?text=Ol%C3%A1%2C+preciso+de+suporte+no+CarreiraBeauty" target="_blank" rel="noopener noreferrer" style={{
          fontSize: 13, color: "#25D366", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
        }}>
          Suporte
        </a>
        <LogoutButton compact />
      </header>

      <main style={{ flex: 1, padding: "20px var(--space-page-x)", maxWidth: 480, width: "100%", margin: "0 auto" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Vagas publicadas", value: jobs?.length ?? 0, color: "var(--color-brand-primary)" },
            { label: "Candidatos recebidos", value: totalCandidatos, color: "var(--color-brand-secondary)" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)", padding: "16px",
              boxShadow: "var(--shadow-xs)",
            }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: s.color, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <Link href="/dashboard/empresa/vagas/nova" style={{
            flex: 1, height: 48, borderRadius: "var(--radius-pill)",
            background: "var(--color-brand-primary)", color: "#fff",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", gap: 6,
          }}>
            + Nova vaga
          </Link>
          <Link href="/dashboard/empresa/perfil" style={{
            flex: 1, height: 48, borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-default)", background: "var(--surface-card)",
            color: "var(--text-primary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
          }}>
            Editar perfil
          </Link>
        </div>

        {/* Jobs list */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Suas vagas
        </p>

        {todasPendentes && (
          <div style={{
            background: "#FFF7ED", border: "1px solid #FED7AA",
            borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 14,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⏳</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#9A3412", marginBottom: 2 }}>
                Vaga em análise
              </p>
              <p style={{ fontSize: 13, color: "#9A3412", lineHeight: 1.5 }}>
                Nossa equipe está revisando sua vaga. Você receberá um email assim que for aprovada — e outro a cada nova candidatura.
              </p>
            </div>
          </div>
        )}

        {!jobs || jobs.length === 0 ? (
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
            padding: "36px 24px", textAlign: "center",
          }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
              Publique sua primeira vaga
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto 20px" }}>
              Em minutos você começa a receber candidatos. A vaga passa por uma análise rápida antes de ser publicada.
            </p>
            <Link href="/dashboard/empresa/vagas/nova" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              height: 44, padding: "0 24px", borderRadius: "var(--radius-pill)",
              background: "var(--color-brand-primary)", color: "#fff",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
              textDecoration: "none",
            }}>
              + Criar vaga
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map((job) => {
              const status = STATUS_STYLE[job.status] ?? STATUS_STYLE.fechada;
              const title = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const count = (job.applications as any)?.[0]?.count ?? 0;

              const rejeitada = job.status === "rejeitada";
              const emAnalise = job.status === "pendente_moderacao";

              return (
                <div key={job.id} style={{
                  background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
                  border: `1px solid ${rejeitada ? "var(--color-danger-border, #FECACA)" : "var(--border-default)"}`,
                  boxShadow: "var(--shadow-xs)", padding: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>
                        {job.titulo || title}
                      </p>
                      {job.faixa_salarial && (
                        <p style={{ fontSize: 13, color: "var(--brand-cyan-700)", fontWeight: 600, marginTop: 2 }}>
                          {job.faixa_salarial}
                        </p>
                      )}
                      {job.tipo_vinculo && (
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>
                          {job.tipo_vinculo}
                        </p>
                      )}
                    </div>
                    <span style={{
                      background: status.bg, color: status.color,
                      fontSize: 11, fontWeight: 700, padding: "4px 10px",
                      borderRadius: "var(--radius-pill)", whiteSpace: "nowrap",
                    }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Motivo de rejeição */}
                  {rejeitada && job.motivo_rejeicao && (
                    <div style={{
                      marginTop: 10, padding: "10px 12px",
                      background: "var(--color-danger-bg)", borderRadius: "var(--radius-md)",
                      borderLeft: "3px solid var(--color-danger-fg)",
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-danger-fg)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Motivo da rejeição
                      </p>
                      <p style={{ fontSize: 13, color: "var(--color-danger-fg)", lineHeight: 1.5 }}>
                        {job.motivo_rejeicao}
                      </p>
                    </div>
                  )}

                  {/* Aviso em análise */}
                  {emAnalise && (
                    <p style={{ fontSize: 12, color: "#C2410C", marginTop: 10 }}>
                      ⏳ Aguardando aprovação — sua vaga será publicada em breve.
                    </p>
                  )}

                  {job.descricao && !rejeitada && !emAnalise && (
                    <p style={{
                      fontSize: 13, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {job.descricao}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        {new Date(job.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                      {(job.status === "ativa" || job.status === "fechada") && (
                        <EncerrarVagaButton jobId={job.id} fechada={job.status === "fechada"} />
                      )}
                    </div>
                    {rejeitada ? (
                      <Link href={`/dashboard/empresa/vagas/${job.id}/editar`} style={{
                        fontSize: 13, fontWeight: 700, color: "var(--color-danger-fg)", textDecoration: "none",
                      }}>
                        Editar e reenviar →
                      </Link>
                    ) : job.status !== "fechada" ? (
                      <Link href={`/dashboard/empresa/vagas/${job.id}/candidatos`} style={{
                        fontSize: 13, fontWeight: 700, color: "var(--color-brand-primary)", textDecoration: "none",
                      }}>
                        {count} candidato{count !== 1 ? "s" : ""} →
                      </Link>
                    ) : (
                      <Link href={`/dashboard/empresa/vagas/${job.id}/candidatos`} style={{
                        fontSize: 13, color: "var(--text-tertiary)", textDecoration: "none",
                      }}>
                        {count} candidato{count !== 1 ? "s" : ""} →
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
