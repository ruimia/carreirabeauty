export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";
import CandidatarButton from "./CandidatarButton";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)",
  manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista",
  maquiador: "Maquiador(a)",
  barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta",
  designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)",
  podologo: "Podólogo(a)",
  recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente",
  outro: "Outro",
};

export default async function DashboardProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!professional) redirect("/onboarding/tipo");
  if (!professional.slug) redirect("/onboarding/profissional");

  // Todas as vagas ativas
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, companies(nome_estabelecimento, cidade, estado, logo_url, instagram)")
    .eq("status", "ativa")
    .order("criado_em", { ascending: false });

  // Candidaturas já feitas por este profissional
  const { data: applications } = await supabase
    .from("applications")
    .select("job_id")
    .eq("professional_id", professional.id);

  const appliedJobIds = new Set((applications ?? []).map((a) => a.job_id));

  const funcao = professional.funcao === "outro"
    ? (professional.funcao_outro || "Outro")
    : (FUNCAO_LABEL[professional.funcao] ?? professional.funcao);

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-square.jpg" alt="CarreiraBeauty" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-800 truncate">{professional.nome}</h1>
            <p className="text-sm text-rose-500">{funcao}</p>
          </div>
          <Link href="/dashboard/profissional/perfil"
            className="text-sm text-gray-400 hover:text-rose-500 transition">
            Perfil
          </Link>
          <Link href={`/perfil/${professional.slug}`}
            className="text-sm text-gray-400 hover:text-rose-500 transition">
            Público
          </Link>
          <LogoutButton compact />
        </div>

        {/* Vagas */}
        <div>
          <p className="text-sm text-gray-500 px-1 mb-3">
            Vagas disponíveis
          </p>

          {!jobs || jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
              <p className="text-lg mb-1">Nenhuma vaga disponível agora</p>
              <p className="text-sm">Volte em breve — novas vagas aparecem aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const company = job.companies as any;
                const alreadyApplied = appliedJobIds.has(job.id);

                return (
                  <div key={job.id} className="bg-white rounded-2xl shadow p-4">
                    <div className="flex items-start gap-3">
                      {company?.logo_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={company.logo_url} alt={company.nome_estabelecimento}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        : (
                          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-xl flex-shrink-0">
                            🏪
                          </div>
                        )
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">
                          {job.funcao === "outro" ? (job.funcao_outro || "Outro") : FUNCAO_LABEL[job.funcao] ?? job.funcao}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {company?.nome_estabelecimento}
                        </p>
                        {company?.cidade && (
                          <p className="text-xs text-gray-400">
                            {company.cidade} · {company.estado}
                          </p>
                        )}
                      </div>
                    </div>

                    {job.descricao && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{job.descricao}</p>
                    )}

                    <div className="flex items-center justify-between mt-3 gap-3">
                      <div>
                        {job.faixa_salarial && (
                          <p className="text-sm font-medium text-gray-700">{job.faixa_salarial}</p>
                        )}
                        {job.tipo_vinculo && (
                          <p className="text-xs text-gray-400 uppercase">{job.tipo_vinculo}</p>
                        )}
                      </div>

                      <CandidatarButton
                        jobId={job.id}
                        professionalId={professional.id}
                        alreadyApplied={alreadyApplied}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
