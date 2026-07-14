export const dynamic = "force-dynamic";

export const metadata = { title: "Conteúdo — Admin" };
import { createClient } from "@/lib/supabase/server";

export default async function AdminConteudoPage() {
  const supabase = await createClient();

  const [
    { data: conteudos },
    { data: views },
    { count: totalPlanoViews },
    { data: planoViews },
    { count: cliquesProfissionalPro },
    { data: assinarClicks },
    { count: profissionaisPro },
  ] = await Promise.all([
    supabase.from("conteudos").select("id, titulo, pro, ativo, ordem").order("ordem", { ascending: true }),
    supabase.from("conteudo_views").select("conteudo_id, professional_id, criado_em"),
    supabase.from("plano_views").select("*", { count: "exact", head: true }),
    supabase.from("plano_views").select("professional_id"),
    supabase.from("assinar_clicks").select("*", { count: "exact", head: true }).eq("plano_key", "profissional_pro"),
    supabase.from("assinar_clicks").select("user_id").eq("plano_key", "profissional_pro"),
    supabase.from("professionals").select("*", { count: "exact", head: true }).eq("plano", "pro"),
  ]);

  const pessoasQueClicaramAssinar = new Set((assinarClicks ?? []).map((c) => c.user_id)).size;

  const viewsPorConteudo = new Map<string, { total: number; unicos: Set<string> }>();
  for (const v of views ?? []) {
    const entry = viewsPorConteudo.get(v.conteudo_id) ?? { total: 0, unicos: new Set<string>() };
    entry.total += 1;
    entry.unicos.add(v.professional_id);
    viewsPorConteudo.set(v.conteudo_id, entry);
  }

  const totalViews = (views ?? []).length;
  const profissionaisUnicos = new Set((views ?? []).map((v) => v.professional_id)).size;

  // Funil: viu algum conteúdo -> visitou Planos -> clicou em Assinar -> é PRO de fato
  // (conteúdo PRO só é gravado como view pra quem JÁ é PRO — o gancho de conversão
  // real é o conteúdo grátis, que é visível/rastreado pra qualquer profissional)
  const viuAlgumConteudo = profissionaisUnicos;
  const profissionaisQueVisitaramPlanos = new Set((planoViews ?? []).map((v) => v.professional_id)).size;

  const funil = [
    { label: "Viu algum conteúdo", valor: viuAlgumConteudo, cor: "bg-gray-100 text-gray-700" },
    { label: "Visitou a página de Planos", valor: profissionaisQueVisitaramPlanos, cor: "bg-blue-50 text-blue-600" },
    { label: "Clicou em Assinar (Pro)", valor: cliquesProfissionalPro ?? 0, cor: "bg-purple-50 text-purple-600" },
    { label: "É PRO hoje", valor: profissionaisPro ?? 0, cor: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">Conteúdo</h1>

      {/* Stats gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-gray-100 text-gray-700">
          <p className="text-3xl font-bold">{totalViews}</p>
          <p className="text-sm mt-1 opacity-70">Views totais</p>
        </div>
        <div className="rounded-xl p-4 bg-blue-50 text-blue-600">
          <p className="text-3xl font-bold">{profissionaisUnicos}</p>
          <p className="text-sm mt-1 opacity-70">Profissionais únicos</p>
        </div>
        <div className="rounded-xl p-4 bg-purple-50 text-purple-600">
          <p className="text-3xl font-bold">{totalPlanoViews ?? 0}</p>
          <p className="text-sm mt-1 opacity-70">Visitas à página de Planos</p>
        </div>
        <div className="rounded-xl p-4 bg-rose-50 text-rose-600">
          <p className="text-3xl font-bold">{pessoasQueClicaramAssinar}</p>
          <p className="text-sm mt-1 opacity-70">Pessoas que clicaram em Assinar</p>
        </div>
      </div>

      {/* Funil de conversão */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Funil de conversão (conteúdo → PRO)</h2>
        </div>
        <div className="p-4 space-y-3">
          {funil.map((f, i) => {
            const anterior = i > 0 ? funil[i - 1].valor : null;
            const pct = anterior && anterior > 0 ? Math.round((f.valor / anterior) * 100) : null;
            return (
              <div key={f.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`rounded-lg px-3 py-1.5 font-bold text-lg ${f.cor}`}>{f.valor}</span>
                  <p className="text-sm text-gray-600 truncate">{f.label}</p>
                </div>
                {pct !== null && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{pct}% do passo anterior</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Views por conteúdo */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Views por conteúdo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Título</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-right px-4 py-3">Views</th>
                <th className="text-right px-4 py-3">Profissionais únicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(conteudos ?? []).map((c) => {
                const stats = viewsPorConteudo.get(c.id) ?? { total: 0, unicos: new Set() };
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{c.titulo}</p>
                      {!c.ativo && <span className="text-xs text-gray-400">(inativo)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.pro ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-500"}`}>
                        {c.pro ? "PRO" : "Grátis"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{stats.total}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{stats.unicos.size}</td>
                  </tr>
                );
              })}
              {(conteudos ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-4 text-gray-400 text-sm">Nenhum conteúdo cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
