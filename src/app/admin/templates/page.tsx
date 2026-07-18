export const dynamic = "force-dynamic";

export const metadata = { title: "Templates de perfil — Admin" };
import { createClient } from "@/lib/supabase/server";
import { TEMPLATES } from "@/components/perfilTemplates/types";

export default async function AdminTemplatesPage() {
  const supabase = await createClient();

  const [{ data: eventos }, { data: professionals }] = await Promise.all([
    supabase.from("template_eventos").select("professional_id, template_id, tipo, criado_em"),
    supabase.from("professionals").select("id, template_id, plano"),
  ]);

  const porTemplate = new Map<string, { previews: Set<string>; paywallHits: Set<string>; aplicados: Set<string> }>();
  for (const t of TEMPLATES) {
    porTemplate.set(t.id, { previews: new Set(), paywallHits: new Set(), aplicados: new Set() });
  }
  for (const e of eventos ?? []) {
    const entry = porTemplate.get(e.template_id);
    if (!entry) continue;
    if (e.tipo === "preview") entry.previews.add(e.professional_id);
    else if (e.tipo === "paywall_hit") entry.paywallHits.add(e.professional_id);
    else if (e.tipo === "aplicado") entry.aplicados.add(e.professional_id);
  }

  const totalPreviews = new Set((eventos ?? []).filter((e) => e.tipo === "preview").map((e) => e.professional_id)).size;
  const totalPaywallHits = new Set((eventos ?? []).filter((e) => e.tipo === "paywall_hit").map((e) => e.professional_id)).size;
  const emUsoAtualmente = new Map<string, number>();
  for (const p of professionals ?? []) {
    emUsoAtualmente.set(p.template_id, (emUsoAtualmente.get(p.template_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">Templates de perfil</h1>

      {/* Stats gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        <div className="rounded-xl p-4 bg-blue-50 text-blue-600">
          <p className="text-3xl font-bold">{totalPreviews}</p>
          <p className="text-sm mt-1 opacity-70">Profissionais que já testaram um tema PRO</p>
        </div>
        <div className="rounded-xl p-4 bg-rose-50 text-rose-600">
          <p className="text-3xl font-bold">{totalPaywallHits}</p>
          <p className="text-sm mt-1 opacity-70">Bateram no paywall ao tentar aplicar</p>
        </div>
      </div>

      {/* Por template */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Funil por template</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Template</th>
                <th className="text-right px-4 py-3">Em uso hoje</th>
                <th className="text-right px-4 py-3">Testaram (preview)</th>
                <th className="text-right px-4 py-3">Bateram no paywall</th>
                <th className="text-right px-4 py-3">Aplicaram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TEMPLATES.map((t) => {
                const stats = porTemplate.get(t.id)!;
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{t.nome}</p>
                        {t.pro && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-50 text-rose-600">PRO</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{emUsoAtualmente.get(t.id) ?? 0}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{t.pro ? stats.previews.size : "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{t.pro ? stats.paywallHits.size : "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{stats.aplicados.size}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100">
          Contagens por profissional único, não por evento — quem testou um tema 3 vezes conta 1.
        </p>
      </div>
    </div>
  );
}
