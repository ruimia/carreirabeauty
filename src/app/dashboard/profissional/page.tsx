export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";
import CandidatarButton from "./CandidatarButton";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

function Avatar({ name, size = 48 }: { name: string; size?: number }) {
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

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, companies(nome_estabelecimento, cidade, estado, logo_url)")
    .eq("status", "ativa")
    .order("criado_em", { ascending: false });

  const { data: applications } = await supabase
    .from("applications").select("job_id").eq("professional_id", professional.id);

  const appliedJobIds = new Set((applications ?? []).map((a) => a.job_id));

  const funcao = professional.funcao === "outro"
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
          <p style={{ fontSize: 12, color: "var(--color-brand-primary)", fontWeight: 600 }}>{funcao}</p>
        </div>
        <Link href="/dashboard/profissional/perfil" style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
          Perfil
        </Link>
        <Link href={`/perfil/${professional.slug}`} style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
          Público
        </Link>
        <a href="https://wa.me/5511987049210?text=Ol%C3%A1%2C+preciso+de+suporte+no+CarreiraBeauty" target="_blank" rel="noopener noreferrer" style={{
          fontSize: 13, color: "#25D366", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
        }}>
          Suporte
        </a>
        <LogoutButton compact />
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: "20px var(--space-page-x)", maxWidth: 480, width: "100%", margin: "0 auto" }}>

        {/* Section heading */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          {jobs?.length ?? 0} vaga{(jobs?.length ?? 0) !== 1 ? "s" : ""} disponíve{(jobs?.length ?? 0) !== 1 ? "is" : "l"}
        </p>

        {/* Empty state */}
        {!jobs || jobs.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Card principal de espera */}
            <div style={{
              background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
              padding: "28px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>✉️</div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
                Seu perfil está ativo
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                Assim que uma vaga compatível com suas especialidades for publicada, você receberá um email.
              </p>
            </div>

            {/* Especialidades configuradas */}
            {(professional.funcoes?.length ?? 0) > 0 && (
              <div style={{
                background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-default)", padding: "16px 20px",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 10 }}>
                  Você receberá vagas de
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(professional.funcoes as string[]).map((f: string) => (
                    <span key={f} style={{
                      background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)",
                      fontSize: 13, fontWeight: 600, padding: "5px 14px",
                      borderRadius: "var(--radius-pill)", border: "1px solid var(--brand-cyan-100)",
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 10 }}>
                  Não é isso? <Link href="/dashboard/profissional/perfil" style={{ color: "var(--color-brand-primary)", fontWeight: 600, textDecoration: "none" }}>Edite seu perfil</Link>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {jobs.map((job) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const company = job.companies as any;
              const alreadyApplied = appliedJobIds.has(job.id);
              const title = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);

              return (
                <div key={job.id} style={{
                  background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xs)", border: "1px solid var(--border-default)",
                  padding: 16,
                }}>
                  {/* Top row */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {company?.logo_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={company.logo_url} alt={company.nome_estabelecimento}
                          style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                      : <Avatar name={company?.nome_estabelecimento ?? "?"} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.25 }}>
                        {title}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {company?.nome_estabelecimento}
                      </p>
                      {company?.cidade && (
                        <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                          📍 {company.cidade} · {company.estado}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {job.descricao && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 12, lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {job.descricao}
                    </p>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                    <div>
                      {job.faixa_salarial && (
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-cyan-700)" }}>
                          {job.faixa_salarial}
                        </p>
                      )}
                      {job.tipo_vinculo && (
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>
                          {job.tipo_vinculo}
                        </p>
                      )}
                    </div>
                    <CandidatarButton jobId={job.id} professionalId={professional.id} alreadyApplied={alreadyApplied} />
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
