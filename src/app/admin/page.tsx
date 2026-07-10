export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };
import { createClient } from "@/lib/supabase/server";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;

  const diffDays = Math.floor(diffH / 24);
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays}d`;

  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalEmpresas },
    { count: totalProfissionais },
    { count: totalVagas },
    { count: totalCandidaturas },
    { data: recentEmpresas },
    { data: recentProfissionais },
    { data: recentProfiles },
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("professionals").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("id, nome_estabelecimento, cidade, status_assinatura, bloqueado, criado_em")
      .order("criado_em", { ascending: false }).limit(5),
    supabase.from("professionals").select("id, nome, funcao, cidade, bloqueado, criado_em")
      .order("criado_em", { ascending: false }).limit(5),
    supabase.from("profiles").select("id, email, tipo, criado_em")
      .order("criado_em", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "Empresas", value: totalEmpresas ?? 0, color: "bg-rose-50 text-rose-600" },
    { label: "Profissionais", value: totalProfissionais ?? 0, color: "bg-blue-50 text-blue-600" },
    { label: "Vagas", value: totalVagas ?? 0, color: "bg-green-50 text-green-600" },
    { label: "Candidaturas", value: totalCandidaturas ?? 0, color: "bg-purple-50 text-purple-600" },
  ];

  // Cruza os últimos cadastros (profiles) com companies/professionals para saber se completaram o onboarding
  const profileIds = (recentProfiles ?? []).map((p) => p.id);
  const [{ data: companiesByUser }, { data: professionalsByUser }] = await Promise.all([
    supabase.from("companies").select("user_id, nome_estabelecimento, status_cadastro").in("user_id", profileIds.length ? profileIds : [""]),
    supabase.from("professionals").select("user_id, nome, slug").in("user_id", profileIds.length ? profileIds : [""]),
  ]);

  const cadastros = (recentProfiles ?? []).map((profile) => {
    const company = companiesByUser?.find((c) => c.user_id === profile.id);
    const professional = professionalsByUser?.find((p) => p.user_id === profile.id);

    if (company?.status_cadastro === "completo") {
      return { id: profile.id, nome: company.nome_estabelecimento, tipo: "empresa" as const, criado_em: profile.criado_em };
    }
    if (professional?.slug) {
      return { id: profile.id, nome: professional.nome, tipo: "profissional" as const, criado_em: profile.criado_em };
    }
    return { id: profile.id, nome: profile.email, tipo: "incompleto" as const, criado_em: profile.criado_em };
  });

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

      {/* Últimos cadastros (inclui incompletos) */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Últimos cadastros</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {cadastros.map((c) => {
            const badge = c.tipo === "empresa"
              ? "bg-rose-50 text-rose-600"
              : c.tipo === "profissional"
              ? "bg-blue-50 text-blue-600"
              : "bg-gray-100 text-gray-500";
            const label = c.tipo === "empresa" ? "Empresa" : c.tipo === "profissional" ? "Profissional" : "Incompleto";
            return (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 truncate min-w-0">{c.nome}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{label}</span>
                  <span className="text-xs text-gray-400">{formatRelativeTime(c.criado_em)}</span>
                </div>
              </div>
            );
          })}
          {cadastros.length === 0 && <p className="text-sm text-gray-400 px-4 py-4">Nenhum cadastro ainda.</p>}
        </div>
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
                  <span className="text-xs text-gray-400">{formatRelativeTime(e.criado_em)}</span>
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
                  <span className="text-xs text-gray-400">{formatRelativeTime(p.criado_em)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
