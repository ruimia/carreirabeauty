export const dynamic = "force-dynamic";
export const metadata = { title: "Candidatos" };

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CandidatoCard from "./CandidatoCard";
import { isProAtivo } from "@/lib/planos";

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

  const { data: applications, error: appError } = await supabase
    .from("applications")
    .select(`id, criado_em, mensagem, professionals(
      id, nome, telefone, funcoes, funcao, funcao_outro,
      bairro, cidade, estado, experiencia, disponibilidade, tipo_vinculo,
      foto_perfil_url, slug, educacao_basica, habilidades,
      educacao, experiencia_prof, portfolio_urls, instagram, plano, plano_validade
    )`)
    .eq("job_id", jobId)
    .order("criado_em", { ascending: false });

  // Destaque do PRO: candidato PRO aparece no topo da lista da empresa.
  // É o benefício que a tela de planos vende — ordenar por data só não o
  // entregava. Dentro de cada grupo, mantém a ordem por data (mais recente
  // primeiro), que é o comportamento que a empresa já conhecia.
  const ordenadas = [...(applications ?? [])].sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profA = a.professionals as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profB = b.professionals as any;
    const proA = isProAtivo(profA?.plano, profA?.plano_validade) ? 1 : 0;
    const proB = isProAtivo(profB?.plano, profB?.plano_validade) ? 1 : 0;
    return proB - proA;
  });

  const funcaoVaga = job.titulo || job.funcao || "Vaga";
  const count = ordenadas.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>

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

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "20px var(--space-page-x)" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="candidatos-grid">
            {ordenadas.map((app) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = app.professionals as any;
              if (!p) return null;
              return (
                <CandidatoCard
                  key={app.id}
                  app={{ id: app.id, criado_em: app.criado_em, mensagem: app.mensagem ?? null, professional: p }}
                  funcaoVaga={funcaoVaga}
                />
              );
            })}
          </div>
        )}

        <style>{`@media (min-width: 860px) { .candidatos-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
      </main>
    </div>
  );
}
