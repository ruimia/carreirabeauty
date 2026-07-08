import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

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

const STATUS_LABEL: Record<string, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  fechada: "Fechada",
  bloqueada_pos_trial: "Bloqueada",
};

const STATUS_COLOR: Record<string, string> = {
  ativa: "bg-green-100 text-green-700",
  pausada: "bg-yellow-100 text-yellow-700",
  fechada: "bg-gray-100 text-gray-500",
  bloqueada_pos_trial: "bg-red-100 text-red-600",
};

export default async function DashboardEmpresaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) redirect("/onboarding/tipo");
  if (company.status_cadastro !== "completo") redirect("/onboarding/empresa");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", company.id)
    .order("criado_em", { ascending: false });

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          {company.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt="Logo"
              className="w-12 h-12 rounded-xl object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-800 truncate">
              {company.nome_estabelecimento}
            </h1>
            <p className="text-sm text-gray-500">{company.cidade} · {company.estado}</p>
          </div>
          <LogoutButton compact />
        </div>

        {/* Publicar vaga */}
        <Link
          href="/dashboard/empresa/vagas/nova"
          className="block w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 text-center transition"
        >
          + Publicar nova vaga
        </Link>

        {/* Lista de vagas */}
        {!jobs || jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
            <p className="text-lg mb-1">Nenhuma vaga publicada ainda</p>
            <p className="text-sm">
              Publique sua primeira vaga e comece a receber candidatos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-500 px-1">
              Suas vagas ({jobs.length})
            </h2>
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {job.funcao === "outro"
                        ? job.funcao_outro || "Outro"
                        : FUNCAO_LABEL[job.funcao] ?? job.funcao}
                    </p>
                    {job.faixa_salarial && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.faixa_salarial}
                      </p>
                    )}
                    {job.tipo_vinculo && (
                      <p className="text-xs text-gray-400 mt-0.5 uppercase">
                        {job.tipo_vinculo}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                      STATUS_COLOR[job.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUS_LABEL[job.status] ?? job.status}
                  </span>
                </div>
                {job.descricao && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {job.descricao}
                  </p>
                )}
                <p className="text-xs text-gray-300 mt-2">
                  {new Date(job.criado_em).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
