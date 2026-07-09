export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { updateJobStatus } from "../actions";
import ModeracaoActions from "./ModeracaoActions";

export default async function AdminVagasPage() {
  const supabase = await createClient();
  const { data: vagas } = await supabase
    .from("jobs")
    .select("id, titulo, funcao, funcao_outro, status, motivo_rejeicao, criado_em, applications(count), companies(nome_estabelecimento, cidade)")
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
        {showMod && <ModeracaoActions id={v.id} />}
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
