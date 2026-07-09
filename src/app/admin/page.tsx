export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalEmpresas },
    { count: totalProfissionais },
    { count: totalVagas },
    { count: totalCandidaturas },
    { data: recentEmpresas },
    { data: recentProfissionais },
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("professionals").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("id, nome_estabelecimento, cidade, status_assinatura, bloqueado, criado_em")
      .order("criado_em", { ascending: false }).limit(5),
    supabase.from("professionals").select("id, nome, funcao, cidade, bloqueado, criado_em")
      .order("criado_em", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Empresas", value: totalEmpresas ?? 0, color: "bg-rose-50 text-rose-600" },
    { label: "Profissionais", value: totalProfissionais ?? 0, color: "bg-blue-50 text-blue-600" },
    { label: "Vagas", value: totalVagas ?? 0, color: "bg-green-50 text-green-600" },
    { label: "Candidaturas", value: totalCandidaturas ?? 0, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">Visão geral</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Empresas recentes */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">Últimas empresas</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentEmpresas?.map((e) => (
              <div key={e.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{e.nome_estabelecimento}</p>
                  <p className="text-xs text-gray-400">{e.cidade}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {e.bloqueado && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Bloqueada</span>}
                  <span className="text-xs text-gray-400">{new Date(e.criado_em).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profissionais recentes */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">Últimos profissionais</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProfissionais?.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400">{p.cidade}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.bloqueado && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Bloqueado</span>}
                  <span className="text-xs text-gray-400">{new Date(p.criado_em).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
