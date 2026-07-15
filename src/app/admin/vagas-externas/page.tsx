export const dynamic = "force-dynamic";

export const metadata = { title: "Vagas externas — Admin" };
import { createClient } from "@/lib/supabase/server";
import AtualizarCacheButton from "./AtualizarCacheButton";

export default async function AdminVagasExternasPage() {
  const supabase = await createClient();

  const [{ count: totalVagas }, { data: ultimaExecucao }] = await Promise.all([
    supabase.from("vagas_externas").select("*", { count: "exact", head: true }),
    supabase.from("vagas_externas_atualizacoes").select("*").order("iniciado_em", { ascending: false }).limit(1).maybeSingle(),
  ]);

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">Vagas externas (Adzuna)</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 bg-gray-100 text-gray-700">
          <p className="text-3xl font-bold">{totalVagas ?? 0}</p>
          <p className="text-sm mt-1 opacity-70">Vagas no cache hoje</p>
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
    </div>
  );
}
