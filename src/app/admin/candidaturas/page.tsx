export const dynamic = "force-dynamic";

export const metadata = { title: "Candidaturas — Admin" };
import { createClient } from "@/lib/supabase/server";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

export default async function AdminCandidaturasPage() {
  const supabase = await createClient();
  const { data: candidaturas } = await supabase
    .from("applications")
    .select("id, criado_em, professionals(nome, funcao), jobs(funcao, funcao_outro, companies(nome_estabelecimento))")
    .order("criado_em", { ascending: false })
    .limit(200);

  const { count: total } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Candidaturas</h1>
        <span className="text-sm text-gray-400">{total ?? 0} total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Profissional</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Vaga</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Empresa</th>
                <th className="text-left px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidaturas?.map((c) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const prof = c.professionals as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const job = c.jobs as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const empresa = job?.companies as any;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-[140px]">{prof?.nome}</p>
                      <p className="text-xs text-gray-400">{FUNCAO_LABEL[prof?.funcao] ?? prof?.funcao}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {job?.funcao === "outro" ? job?.funcao_outro : FUNCAO_LABEL[job?.funcao] ?? job?.funcao}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell truncate max-w-[160px]">
                      {empresa?.nome_estabelecimento}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
