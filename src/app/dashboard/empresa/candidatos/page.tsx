export const metadata = { title: "Potenciais candidatos" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { distanciaKm } from "@/lib/geocode";
import CandidatoPotencialCard from "./CandidatoPotencialCard";

const RAIO_KM = 30;

export default async function CandidatosPotenciaisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase.from("companies").select("*").eq("user_id", user.id).maybeSingle();
  if (!company) redirect("/onboarding/tipo");
  if (company.status_cadastro !== "completo") redirect("/onboarding/empresa");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, titulo, funcao, funcoes")
    .eq("company_id", company.id)
    .eq("status", "ativa");

  if (!jobs || jobs.length === 0) {
    return (
      <main className="page-x">
        <p className="section-label">Candidatos potenciais</p>
        <div className="card card-xl" style={{ padding: "36px 24px", textAlign: "center" }}>
          <i className="ph ph-users-three" style={{ fontSize: 40, color: "var(--text-tertiary)", marginBottom: 12, display: "block" }}></i>
          <p style={{ font: "var(--text-h2)", color: "var(--text-primary)", marginBottom: 8 }}>
            Nenhuma vaga ativa no momento
          </p>
          <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
            Assim que você tiver uma vaga publicada, mostramos aqui os profissionais que combinam com ela.
          </p>
        </div>
      </main>
    );
  }

  const jobsComFuncoes = jobs.map((j) => ({
    ...j,
    funcoes: j.funcoes?.length ? j.funcoes : (j.funcao ? [j.funcao] : []),
  }));
  const todasFuncoes = Array.from(new Set(jobsComFuncoes.flatMap((j) => j.funcoes)));

  const { data: candidatos } = await supabase
    .from("professionals")
    .select(`
      id, user_id, nome, telefone, funcoes, funcao, funcao_outro,
      bairro, cidade, estado, latitude, longitude, experiencia,
      disponibilidade, tipo_vinculo, foto_perfil_url, slug, plano, bloqueado, criado_em
    `)
    .overlaps("funcoes", todasFuncoes);

  const { data: applications } = await supabase
    .from("applications")
    .select("professional_id, job_id")
    .in("job_id", jobs.map((j) => j.id));

  const jaAplicaram = new Set((applications ?? []).map((a) => a.professional_id));

  const empresaGeo = company.latitude && company.longitude
    ? { latitude: company.latitude, longitude: company.longitude }
    : null;

  const potenciais = (candidatos ?? [])
    .filter((p) => !p.bloqueado && !jaAplicaram.has(p.id))
    .map((p) => {
      const profGeo = p.latitude && p.longitude ? { latitude: p.latitude, longitude: p.longitude } : null;

      const dentroDoRaio = empresaGeo && profGeo
        ? distanciaKm(empresaGeo, profGeo) <= RAIO_KM
        : (!company.cidade || !p.cidade || company.cidade === p.cidade);

      const vagasCompatveis = jobsComFuncoes.filter((j) =>
        j.funcoes.some((fv: string) => (p.funcoes ?? []).some((f: string) => f.toLowerCase() === fv.toLowerCase()))
      );

      const distanciaKmValor = empresaGeo && profGeo ? Math.round(distanciaKm(empresaGeo, profGeo)) : null;

      return { p, dentroDoRaio, vagasCompatveis, distanciaKmValor };
    })
    .filter((x) => x.dentroDoRaio && x.vagasCompatveis.length > 0);

  return (
    <main className="page-x">
      <p className="section-label">Candidatos potenciais</p>
      <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
        Profissionais que combinam com suas vagas ativas, num raio de {RAIO_KM}km. Convide direto por WhatsApp ou email.
      </p>

      {potenciais.length === 0 ? (
        <div className="card card-xl" style={{ padding: "36px 24px", textAlign: "center" }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 40, color: "var(--text-tertiary)", marginBottom: 12, display: "block" }}></i>
          <p style={{ font: "var(--text-h2)", color: "var(--text-primary)", marginBottom: 8 }}>
            Nenhum candidato encontrado ainda
          </p>
          <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
            Assim que profissionais com o perfil certo se cadastrarem na região, eles aparecem aqui.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {potenciais.map(({ p, vagasCompatveis, distanciaKmValor }) => (
            <CandidatoPotencialCard
              key={p.id}
              professional={p}
              vagas={vagasCompatveis.map((j) => ({ id: j.id, titulo: j.titulo || j.funcoes[0] || "Vaga" }))}
              distanciaKm={distanciaKmValor}
            />
          ))}
        </div>
      )}
    </main>
  );
}
