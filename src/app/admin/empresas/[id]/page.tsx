export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toggleBloqueioEmpresa, updateJobStatus } from "../../actions";
import EmpresaEditForm from "./EmpresaEditForm";
import VagaEditForm from "../../vagas/VagaEditForm";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

export default async function AdminEmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: empresa } = await supabase.from("companies").select("*, profiles(email)").eq("id", id).single();
  if (!empresa) notFound();

  const email = (empresa.profiles as { email?: string } | null)?.email;

  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      id, titulo, funcao, funcao_outro, status, criado_em, descricao,
      tipo_vinculo, faixa_salarial, comissao, endereco, bairro, cidade, estado, cep,
      applications(count)
    `)
    .eq("company_id", id)
    .order("criado_em", { ascending: false });

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/empresas" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-xl font-bold text-gray-800 flex-1 truncate">{empresa.nome_estabelecimento}</h1>
      </div>

      {/* Info + ações */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        {/* Email + WhatsApp em destaque */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400">E-mail</p>
            {email
              ? <a href={`mailto:${email}`} className="text-sm font-medium text-rose-600 hover:underline break-all">{email}</a>
              : <p className="text-sm text-gray-400">—</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400">WhatsApp / Telefone</p>
            {empresa.telefone
              ? <a href={`https://wa.me/55${empresa.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-green-600 hover:underline">{empresa.telefone}</a>
              : <p className="text-sm text-gray-400">—</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["CNPJ", empresa.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")],
            ["Responsável", empresa.responsavel],
            ["Cidade", `${[empresa.bairro, empresa.cidade].filter(Boolean).join(", ")} · ${empresa.estado}`],
            ["Categoria", empresa.categoria_negocio],
            ["Funcionários", empresa.faixa_funcionarios],
            ["Assinatura", empresa.status_assinatura],
            ["Cadastro", empresa.status_cadastro],
            ["Instagram", empresa.instagram ? `@${empresa.instagram}` : "—"],
            ["Desde", new Date(empresa.criado_em).toLocaleDateString("pt-BR")],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs text-gray-400">{l}</p>
              <p className="font-medium text-gray-700">{v || "—"}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
          <form action={toggleBloqueioEmpresa.bind(null, empresa.id, !empresa.bloqueado)}>
            <button className={`text-sm font-medium px-4 py-2 rounded-xl transition ${
              empresa.bloqueado
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}>
              {empresa.bloqueado ? "Desbloquear empresa" : "Bloquear empresa"}
            </button>
          </form>
        </div>

        <div>
          <EmpresaEditForm
            id={empresa.id}
            inicial={{
              nome_estabelecimento: empresa.nome_estabelecimento ?? "",
              responsavel: empresa.responsavel ?? "",
              telefone: empresa.telefone ?? "",
              cnpj: empresa.cnpj ?? "",
              endereco: empresa.endereco ?? "",
              bairro: empresa.bairro ?? "",
              cidade: empresa.cidade ?? "",
              estado: empresa.estado ?? "",
              cep: empresa.cep ?? "",
              categoria_negocio: empresa.categoria_negocio ?? "",
              faixa_funcionarios: empresa.faixa_funcionarios ?? "",
              instagram: empresa.instagram ?? "",
            }}
          />
        </div>
      </div>

      {/* Vagas */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm">Vagas ({jobs?.length ?? 0})</h2>
        </div>
        {!jobs?.length ? (
          <p className="text-sm text-gray-400 px-4 py-4">Nenhuma vaga publicada.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job) => (
              <div key={job.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {job.titulo || (job.funcao === "outro" ? job.funcao_outro : FUNCAO_LABEL[job.funcao] ?? job.funcao)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(job.applications as any)?.[0]?.count ?? 0} candidatura(s) · {new Date(job.criado_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      job.status === "ativa" ? "bg-green-100 text-green-700" :
                      job.status === "pausada" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{job.status}</span>
                    <form action={updateJobStatus.bind(null, job.id, job.status === "ativa" ? "fechada" : "ativa")}>
                      <button className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                        {job.status === "ativa" ? "Fechar" : "Reativar"}
                      </button>
                    </form>
                  </div>
                </div>
                <div className="mt-2">
                  <VagaEditForm
                    id={job.id}
                    inicial={{
                      titulo: job.titulo ?? "",
                      funcao: job.funcao ?? "",
                      funcao_outro: job.funcao_outro ?? "",
                      descricao: job.descricao ?? "",
                      tipo_vinculo: job.tipo_vinculo ?? "",
                      faixa_salarial: job.faixa_salarial ?? "",
                      comissao: job.comissao ?? "",
                      endereco: job.endereco ?? "",
                      bairro: job.bairro ?? "",
                      cidade: job.cidade ?? "",
                      estado: job.estado ?? "",
                      cep: job.cep ?? "",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
