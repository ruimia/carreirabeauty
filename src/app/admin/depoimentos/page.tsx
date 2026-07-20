export const dynamic = "force-dynamic";

export const metadata = { title: "Depoimentos — Admin" };

import { createClient } from "@/lib/supabase/server";

export default async function AdminDepoimentosPage() {
  const supabase = await createClient();

  const [{ data: depoimentos }, { count: totalProfissionais }] = await Promise.all([
    supabase
      .from("depoimentos")
      .select("id, nome_cliente, estrelas, texto, status, criado_em, professionals(nome, slug)")
      .order("criado_em", { ascending: false })
      .limit(200),
    supabase.from("professionals").select("*", { count: "exact", head: true }),
  ]);

  const total = depoimentos?.length ?? 0;
  const aprovados = (depoimentos ?? []).filter((d) => d.status === "aprovado");
  const pendentes = (depoimentos ?? []).filter((d) => d.status === "pendente");
  const rejeitados = (depoimentos ?? []).filter((d) => d.status === "rejeitado");

  const decididos = aprovados.length + rejeitados.length;
  const taxaAprovacao = decididos > 0 ? Math.round((aprovados.length / decididos) * 100) : null;
  const notaMedia = aprovados.length > 0
    ? (aprovados.reduce((acc, d) => acc + d.estrelas, 0) / aprovados.length).toFixed(1)
    : null;

  const profissionaisComDepoimento = new Set(
    aprovados.map((d) => (d.professionals as unknown as { slug: string } | null)?.slug).filter(Boolean)
  ).size;
  const adocaoPct = totalProfissionais ? Math.round((profissionaisComDepoimento / totalProfissionais) * 100) : 0;

  const funil = [
    { label: "Total de profissionais", valor: totalProfissionais ?? 0, cor: "bg-gray-100 text-gray-700" },
    { label: "Colheram ao menos 1 depoimento aprovado", valor: profissionaisComDepoimento, cor: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Depoimentos</h1>
        <p className="text-sm text-gray-400 mt-1">Últimos {total} envios (limite de 200)</p>
      </div>

      {/* Stats gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-gray-100 text-gray-700">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-sm mt-1 opacity-70">Total enviados</p>
        </div>
        <div className="rounded-xl p-4 bg-amber-50 text-amber-600">
          <p className="text-3xl font-bold">{pendentes.length}</p>
          <p className="text-sm mt-1 opacity-70">Aguardando aprovação</p>
        </div>
        <div className="rounded-xl p-4 bg-purple-50 text-purple-600">
          <p className="text-3xl font-bold">{aprovados.length}</p>
          <p className="text-sm mt-1 opacity-70">Aprovados</p>
        </div>
        <div className="rounded-xl p-4 bg-rose-50 text-rose-600">
          <p className="text-3xl font-bold">{rejeitados.length}</p>
          <p className="text-sm mt-1 opacity-70">Rejeitados</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 bg-white border border-gray-100">
          <p className="text-2xl font-bold text-gray-800">{taxaAprovacao !== null ? `${taxaAprovacao}%` : "—"}</p>
          <p className="text-sm mt-1 text-gray-500">Taxa de aprovação (de quem já foi decidido)</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100">
          <p className="text-2xl font-bold text-gray-800">{notaMedia ?? "—"} {notaMedia && <span className="text-base font-normal text-gray-400">/ 5</span>}</p>
          <p className="text-sm mt-1 text-gray-500">Nota média dos aprovados</p>
        </div>
      </div>

      {/* Adoção — quantos profissionais já usam o recurso de verdade */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Adoção do recurso</h2>
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
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-rose-400 rounded-full" style={{ width: `${adocaoPct}%` }} />
          </div>
        </div>
      </div>

      {/* Lista recente */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Envios recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Profissional</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Nota</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Depoimento</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(depoimentos ?? []).map((d) => {
                const prof = d.professionals as unknown as { nome: string; slug: string } | null;
                const statusCor = d.status === "aprovado" ? "bg-emerald-50 text-emerald-600"
                  : d.status === "rejeitado" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600";
                return (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-gray-700">{prof?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{d.nome_cliente}</td>
                    <td className="px-4 py-3 text-gray-700">{d.estrelas} ★</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell max-w-xs truncate">{d.texto}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusCor}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(d.criado_em).toLocaleDateString("pt-BR")}</td>
                  </tr>
                );
              })}
              {total === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhum depoimento enviado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
