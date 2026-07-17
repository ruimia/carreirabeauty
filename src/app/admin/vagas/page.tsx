export const dynamic = "force-dynamic";

export const metadata = { title: "Moderação de vagas — Admin" };
import { createClient } from "@/lib/supabase/server";
import { updateJobStatus } from "../actions";
import ModeracaoActions from "./ModeracaoActions";
import DispararEmailButton from "./DispararEmailButton";
import VagaEditForm from "./VagaEditForm";

export default async function AdminVagasPage() {
  const supabase = await createClient();
  const { data: vagas } = await supabase
    .from("jobs")
    .select(`
      id, titulo, funcao, funcao_outro, status, motivo_rejeicao, criado_em,
      descricao, tipo_vinculo, modelo_remuneracao, faixa_salarial, comissao,
      endereco, bairro, cidade, estado, cep, foto_url,
      applications(count), companies(nome_estabelecimento, cidade)
    `)
    .order("criado_em", { ascending: false });

  const pendentes = vagas?.filter((v) => v.status === "pendente_moderacao") ?? [];
  const resto = vagas?.filter((v) => v.status !== "pendente_moderacao") ?? [];

  const counts = { ativa: 0, pendente: 0, rejeitada: 0, fechada: 0 };
  vagas?.forEach((v) => {
    if (v.status === "ativa") counts.ativa++;
    else if (v.status === "pendente_moderacao") counts.pendente++;
    else if (v.status === "rejeitada") counts.rejeitada++;
    else counts.fechada++;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ativa: "bg-green-100 text-green-700",
      pendente_moderacao: "bg-orange-100 text-orange-700",
      rejeitada: "bg-red-100 text-red-700",
      pausada: "bg-yellow-100 text-yellow-700",
      fechada: "bg-gray-100 text-gray-500",
    };
    const labels: Record<string, string> = {
      ativa: "Ativa", pendente_moderacao: "Em análise",
      rejeitada: "Rejeitada", pausada: "Pausada", fechada: "Fechada",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const VagaRow = ({ v, showMod }: { v: any; showMod: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empresa = v.companies as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = (v.applications as any)?.[0]?.count ?? 0;
    const funcaoLabel = v.titulo || v.funcao_outro || v.funcao || "—";
    return (
      <div className="px-4 py-3 border-b border-gray-50 last:border-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-gray-800 truncate">{funcaoLabel}</p>
            <p className="text-xs text-gray-400">{empresa?.nome_estabelecimento} · {empresa?.cidade}</p>
            <p className="text-xs text-gray-400">{new Date(v.criado_em).toLocaleDateString("pt-BR")} · {count} candidatura{count !== 1 ? "s" : ""}</p>
            {v.motivo_rejeicao && (
              <p className="text-xs text-rose-600 mt-1 italic">"{v.motivo_rejeicao}"</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {statusBadge(v.status)}
            {!showMod && v.status !== "pendente_moderacao" && (
              <form action={updateJobStatus.bind(null, v.id, v.status === "ativa" ? "fechada" : "ativa")}>
                <button className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                  {v.status === "ativa" ? "Fechar" : "Reativar"}
                </button>
              </form>
            )}
          </div>
        </div>

        <details className="mt-2 group">
          <summary className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer select-none list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▸</span> Ver detalhes da vaga
          </summary>
          <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            {v.foto_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.foto_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Descrição</p>
              <p className="text-gray-700 whitespace-pre-wrap">{v.descricao || "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Tipo de vínculo</p>
                <p className="text-gray-700">{v.tipo_vinculo || "Não especificado"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Modelo de remuneração</p>
                <p className="text-gray-700">{v.modelo_remuneracao || "—"}</p>
              </div>
              {v.faixa_salarial && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Faixa salarial</p>
                  <p className="text-gray-700">{v.faixa_salarial}</p>
                </div>
              )}
              {v.comissao && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Comissão</p>
                  <p className="text-gray-700">{v.comissao}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Endereço</p>
              <p className="text-gray-700">{[v.endereco, v.bairro, v.cidade, v.estado, v.cep].filter(Boolean).join(", ") || "—"}</p>
            </div>
          </div>
        </details>

        <div className="mt-2">
          <VagaEditForm
            id={v.id}
            inicial={{
              titulo: v.titulo ?? "",
              funcao: v.funcao ?? "",
              funcao_outro: v.funcao_outro ?? "",
              descricao: v.descricao ?? "",
              tipo_vinculo: v.tipo_vinculo ?? "",
              faixa_salarial: v.faixa_salarial ?? "",
              comissao: v.comissao ?? "",
              endereco: v.endereco ?? "",
              bairro: v.bairro ?? "",
              cidade: v.cidade ?? "",
              estado: v.estado ?? "",
              cep: v.cep ?? "",
            }}
          />
        </div>

        {showMod && <ModeracaoActions id={v.id} />}
        {v.status === "ativa" && <DispararEmailButton id={v.id} />}
      </div>
    );
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Vagas</h1>
        <span className="text-sm text-gray-400">{vagas?.length ?? 0} total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Ativas", value: counts.ativa, color: "bg-green-50 text-green-700" },
          { label: "Em análise", value: counts.pendente, color: "bg-orange-50 text-orange-700" },
          { label: "Rejeitadas", value: counts.rejeitada, color: "bg-red-50 text-red-700" },
          { label: "Fechadas", value: counts.fechada, color: "bg-gray-50 text-gray-500" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-3 ${s.color} text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Fila de moderação */}
      {pendentes.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-2">
            ⏳ Aguardando aprovação ({pendentes.length})
          </h2>
          <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
            {pendentes.map((v) => <VagaRow key={v.id} v={v} showMod />)}
          </div>
        </div>
      )}

      {/* Todas as vagas */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Todas as vagas</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {resto.length === 0
            ? <p className="px-4 py-6 text-sm text-gray-400 text-center">Nenhuma outra vaga.</p>
            : resto.map((v) => <VagaRow key={v.id} v={v} showMod={false} />)
          }
        </div>
      </div>
    </div>
  );
}
