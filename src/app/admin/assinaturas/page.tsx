export const dynamic = "force-dynamic";

export const metadata = { title: "Assinaturas — Admin" };

import { createClient } from "@/lib/supabase/server";
import { PLANOS_EMPRESA, PLANOS_PROFISSIONAL, isProAtivo } from "@/lib/planos";
import PlanoSelect from "./PlanoSelect";

const PLANOS_EMPRESA_KEYS = ["gratis", "premium"] as const;
const PLANOS_PROF_KEYS = ["gratis", "pro"] as const;

export default async function AssinaturasPage() {
  const supabase = await createClient();

  const [{ data: empresas }, { data: profissionais }] = await Promise.all([
    supabase
      .from("companies")
      .select("id, nome_estabelecimento, cidade, plano, plano_status, plano_validade, criado_em")
      .order("criado_em", { ascending: false }),
    supabase
      .from("professionals")
      .select("id, nome, funcao, cidade, plano, plano_status, plano_validade, criado_em")
      .order("criado_em", { ascending: false }),
  ]);

  // MRR estimado — só empresa entra aqui: assinatura recorrente de verdade.
  // Profissional PRO virou pacote pré-pago (seção 4.5 do doc do projeto), não
  // é receita recorrente — misturar os dois no mesmo MRR ficaria incorreto.
  const mrr = (empresas ?? []).reduce((sum, e) => {
    return sum + (PLANOS_EMPRESA[e.plano as keyof typeof PLANOS_EMPRESA]?.preco ?? 0);
  }, 0);

  const empresasPagas = (empresas ?? []).filter((e) => e.plano !== "gratis").length;
  // PRO só conta como "pago" de verdade se a validade ainda não venceu — sem
  // isso, profissional com pacote expirado (que ainda não foi rebaixado no
  // banco, já que não há cron de expiração) apareceria como ativo pra sempre.
  const profissionaisPagos = (profissionais ?? []).filter((p) => isProAtivo(p.plano, p.plano_validade)).length;

  const statsByPlanoEmpresa = PLANOS_EMPRESA_KEYS.map((k) => ({
    nome: PLANOS_EMPRESA[k].nome,
    count: (empresas ?? []).filter((e) => e.plano === k).length,
    preco: PLANOS_EMPRESA[k].preco,
  }));

  // Sem coluna de preço/mês aqui — profissional PRO virou pacote pré-pago
  // (30/90/365 dias, preços diferentes por pacote), não faz mais sentido
  // multiplicar por um preço mensal único
  const statsByPlanoProfissional = PLANOS_PROF_KEYS.map((k) => ({
    nome: PLANOS_PROFISSIONAL[k].nome,
    count: (profissionais ?? []).filter((p) => p.plano === k).length,
  }));

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">Assinaturas</h1>

      {/* MRR + contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-purple-50 text-purple-700 col-span-2 sm:col-span-1">
          <p className="text-3xl font-bold">R$ {mrr}</p>
          <p className="text-sm mt-1 opacity-70">MRR estimado (empresas)</p>
        </div>
        <div className="rounded-xl p-4 bg-rose-50 text-rose-600">
          <p className="text-3xl font-bold">{empresasPagas}</p>
          <p className="text-sm mt-1 opacity-70">Empresas pagas</p>
        </div>
        <div className="rounded-xl p-4 bg-cyan-50 text-cyan-700">
          <p className="text-3xl font-bold">{profissionaisPagos}</p>
          <p className="text-sm mt-1 opacity-70">Profissionais pagos</p>
        </div>
        <div className="rounded-xl p-4 bg-gray-50 text-gray-600">
          <p className="text-3xl font-bold">{empresasPagas + profissionaisPagos}</p>
          <p className="text-sm mt-1 opacity-70">Total pagantes</p>
        </div>
      </div>

      {/* Distribuição por plano */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-500 mb-3">Empresas por plano</p>
          <div className="space-y-2">
            {statsByPlanoEmpresa.map((s) => (
              <div key={s.nome} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{s.nome}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {s.preco > 0 ? `R$ ${s.preco * s.count}/mês` : ""}
                  </span>
                  <span className="text-sm font-bold text-gray-800 w-6 text-right">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-500 mb-3">Profissionais por plano</p>
          <div className="space-y-2">
            {statsByPlanoProfissional.map((s) => (
              <div key={s.nome} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{s.nome}</span>
                <span className="text-sm font-bold text-gray-800 w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista empresas */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm">Empresas ({empresas?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(empresas ?? []).map((e) => (
            <div key={e.id} className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{e.nome_estabelecimento}</p>
                <p className="text-xs text-gray-400">{e.cidade}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {e.plano_validade && (
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    até {new Date(e.plano_validade).toLocaleDateString("pt-BR")}
                  </span>
                )}
                <PlanoSelect
                  id={e.id}
                  tipo="empresa"
                  planoAtual={e.plano ?? "gratis"}
                  opcoesPlano={["gratis", "premium"]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista profissionais */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Profissionais ({profissionais?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(profissionais ?? []).map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                <p className="text-xs text-gray-400">{p.funcao}{p.cidade ? ` · ${p.cidade}` : ""}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {p.plano_validade && (
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    até {new Date(p.plano_validade).toLocaleDateString("pt-BR")}
                  </span>
                )}
                <PlanoSelect
                  id={p.id}
                  tipo="profissional"
                  planoAtual={p.plano ?? "gratis"}
                  opcoesPlano={["gratis", "pro"]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
