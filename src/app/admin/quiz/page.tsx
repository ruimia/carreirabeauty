export const dynamic = "force-dynamic";

export const metadata = { title: "Jornada do Quiz — Admin" };

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { TRILHAS, getTrilha } from "@/lib/quizContent";

interface Props {
  searchParams: Promise<{ trilha?: string }>;
}

export default async function AdminQuizPage({ searchParams }: Props) {
  const { trilha: trilhaSlugParam } = await searchParams;
  const trilha = getTrilha(trilhaSlugParam ?? "") ?? TRILHAS[0];
  const supabase = await createClient();

  const [
    { data: progresso },
    { data: eventos },
    { count: totalProfissionais },
  ] = await Promise.all([
    supabase.from("quiz_progresso").select("professional_id, modulo_slug, concluido_em").eq("trilha_slug", trilha.slug),
    supabase.from("quiz_eventos").select("professional_id, evento, criado_em").eq("trilha_slug", trilha.slug),
    supabase.from("professionals").select("*", { count: "exact", head: true }),
  ]);

  const totalModulos = trilha.modulos.length;

  // Progresso por profissional (quantos módulos cada um concluiu)
  const modulosPorProfissional = new Map<string, Set<string>>();
  for (const p of progresso ?? []) {
    const set = modulosPorProfissional.get(p.professional_id) ?? new Set<string>();
    set.add(p.modulo_slug);
    modulosPorProfissional.set(p.professional_id, set);
  }

  const iniciaram = modulosPorProfissional.size;
  const completaramTrilha = [...modulosPorProfissional.values()].filter((s) => s.size === totalModulos).length;

  const tentativas = new Set((eventos ?? []).filter((e) => e.evento === "certificado_tentativa").map((e) => e.professional_id));
  const desbloqueados = new Set((eventos ?? []).filter((e) => e.evento === "certificado_desbloqueado").map((e) => e.professional_id));

  const funil = [
    { label: "Total de profissionais", valor: totalProfissionais ?? 0, cor: "bg-gray-100 text-gray-700" },
    { label: `Iniciaram a trilha (≥1 módulo)`, valor: iniciaram, cor: "bg-blue-50 text-blue-600" },
    { label: `Completaram a trilha (${totalModulos}/${totalModulos})`, valor: completaramTrilha, cor: "bg-purple-50 text-purple-600" },
    { label: "Tentaram resgatar o certificado", valor: tentativas.size, cor: "bg-amber-50 text-amber-600" },
    { label: "Desbloquearam o certificado (viraram/já eram PRO)", valor: desbloqueados.size, cor: "bg-rose-50 text-rose-600" },
  ];

  // Funil por módulo — pra ver em qual módulo as pessoas mais desistem
  const profissionaisPorModulo = new Map<string, Set<string>>();
  for (const p of progresso ?? []) {
    const set = profissionaisPorModulo.get(p.modulo_slug) ?? new Set<string>();
    set.add(p.professional_id);
    profissionaisPorModulo.set(p.modulo_slug, set);
  }

  // Quantos tentaram resgatar mas NÃO desbloquearam (grátis que bateu no paywall e não virou PRO)
  const tentaramMasNaoDesbloquearam = [...tentativas].filter((id) => !desbloqueados.has(id)).length;

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Jornada do Quiz</h1>
        <p className="text-sm text-gray-400 mt-1">Trilha: {trilha.titulo}</p>
      </div>

      {/* Seletor de trilha — funil é sempre de uma trilha por vez */}
      <div className="flex gap-2 flex-wrap">
        {TRILHAS.map((t) => (
          <Link
            key={t.slug}
            href={`/admin/quiz?trilha=${t.slug}`}
            className={`text-sm px-3 py-1.5 rounded-full border ${t.slug === trilha.slug ? "bg-rose-500 text-white border-rose-500" : "text-gray-600 border-gray-200"}`}
          >
            {t.titulo}
          </Link>
        ))}
      </div>

      {/* Stats gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 bg-gray-100 text-gray-700">
          <p className="text-3xl font-bold">{iniciaram}</p>
          <p className="text-sm mt-1 opacity-70">Iniciaram a trilha</p>
        </div>
        <div className="rounded-xl p-4 bg-purple-50 text-purple-600">
          <p className="text-3xl font-bold">{completaramTrilha}</p>
          <p className="text-sm mt-1 opacity-70">Completaram ({totalModulos}/{totalModulos})</p>
        </div>
        <div className="rounded-xl p-4 bg-rose-50 text-rose-600 col-span-2 sm:col-span-1">
          <p className="text-3xl font-bold">{desbloqueados.size}</p>
          <p className="text-sm mt-1 opacity-70">Desbloquearam certificado</p>
        </div>
      </div>

      {/* O número que responde a pergunta original: incentiva virar PRO? */}
      <div className="rounded-xl p-4 bg-amber-50 border border-amber-100">
        <p className="text-sm text-amber-800">
          <span className="font-bold">{tentaramMasNaoDesbloquearam}</span> pessoa(s) bateram no paywall do certificado
          (tentaram resgatar) mas ainda não são PRO — esse é o sinal direto de intenção de compra gerado pelo quiz.
        </p>
      </div>

      {/* Funil completo */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Funil completo</h2>
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

      {/* Funil por módulo — onde as pessoas travam */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Conclusão por módulo</h2>
        </div>
        <div className="p-4 space-y-3">
          {trilha.modulos.map((m, i) => {
            const count = profissionaisPorModulo.get(m.slug)?.size ?? 0;
            const pct = iniciaram > 0 ? Math.round((count / iniciaram) * 100) : 0;
            return (
              <div key={m.slug}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">Módulo {i + 1} — {m.titulo}</span>
                  <span className="text-gray-500 font-medium">{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {iniciaram === 0 && (
            <p className="text-sm text-gray-400">Ninguém iniciou a trilha ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
