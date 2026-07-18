export const dynamic = "force-dynamic";

// Processa ~30 cidades chamando a API da Adzuna uma a uma — leva bem mais
// que o timeout padrão de função serverless (10s no plano atual), por isso
// precisa desse teto maior. Server Actions herdam o maxDuration da página
// que os usa (AtualizarCacheButton chama rodarAtualizacaoAdzuna daqui).
export const maxDuration = 60;

export const metadata = { title: "Vagas externas — Admin" };
import { createClient } from "@/lib/supabase/server";
import AtualizarCacheButton from "./AtualizarCacheButton";

export default async function AdminVagasExternasPage() {
  const supabase = await createClient();

  const [{ count: totalVagas }, { data: ultimaExecucao }, { data: cliques }] = await Promise.all([
    supabase.from("vagas_externas").select("*", { count: "exact", head: true }),
    supabase.from("vagas_externas_atualizacoes").select("*").order("iniciado_em", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("vagas_externas_clicks").select("vaga_externa_id, professional_id, vagas_externas(titulo, empresa)"),
  ]);

  const totalCliques = cliques?.length ?? 0;
  const profissionaisUnicos = new Set((cliques ?? []).map((c) => c.professional_id)).size;

  const contagemPorVaga = new Map<string, { titulo: string; empresa: string | null; total: number }>();
  for (const c of cliques ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vaga = c.vagas_externas as any;
    const entry = contagemPorVaga.get(c.vaga_externa_id) ?? { titulo: vaga?.titulo ?? "(vaga removida)", empresa: vaga?.empresa ?? null, total: 0 };
    entry.total += 1;
    contagemPorVaga.set(c.vaga_externa_id, entry);
  }
  const topVagas = [...contagemPorVaga.values()].sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">Vagas externas (Adzuna)</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 bg-gray-100 text-gray-700">
          <p className="text-3xl font-bold">{totalVagas ?? 0}</p>
          <p className="text-sm mt-1 opacity-70">Vagas no cache hoje</p>
        </div>
        <div className="rounded-xl p-4 bg-blue-50 text-blue-600">
          <p className="text-3xl font-bold">{totalCliques}</p>
          <p className="text-sm mt-1 opacity-70">Cliques totais</p>
        </div>
        <div className="rounded-xl p-4 bg-purple-50 text-purple-600">
          <p className="text-3xl font-bold">{profissionaisUnicos}</p>
          <p className="text-sm mt-1 opacity-70">Profissionais únicos</p>
        </div>
      </div>

      <AtualizarCacheButton />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Última execução registrada</h2>
        </div>
        <div className="p-4 text-sm text-gray-600 space-y-1">
          {!ultimaExecucao && <p className="text-gray-400">Nenhuma execução registrada ainda.</p>}
          {ultimaExecucao && (
            <>
              <p><strong>Quando:</strong> {new Date(ultimaExecucao.iniciado_em).toLocaleString("pt-BR")}</p>
              <p><strong>Cidades processadas:</strong> {ultimaExecucao.cidades_processadas ?? "—"}</p>
              <p><strong>Chamadas à API:</strong> {ultimaExecucao.chamadas_api ?? "—"}</p>
              <p><strong>Vagas encontradas:</strong> {ultimaExecucao.vagas_encontradas ?? "—"}</p>
              {ultimaExecucao.erro && <p className="text-rose-600"><strong>Erro:</strong> {ultimaExecucao.erro}</p>}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Vagas externas mais clicadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Título</th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-right px-4 py-3">Cliques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topVagas.map((v, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{v.titulo}</td>
                  <td className="px-4 py-3 text-gray-500">{v.empresa ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{v.total}</td>
                </tr>
              ))}
              {topVagas.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-4 text-gray-400 text-sm">Nenhum clique registrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
