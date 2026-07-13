export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DailySignupsChart from "./DailySignupsChart";

const CHART_DAYS = 30;
const TZ = "America/Sao_Paulo";

// Formata uma data (UTC ou qualquer offset) como YYYY-MM-DD no horário de São Paulo
function toSaoPauloDay(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function bucketByDay(dates: string[], days: number): { date: string; count: number }[] {
  const buckets = new Map<string, number>();
  const todayKey = toSaoPauloDay(new Date());
  const today = new Date(`${todayKey}T00:00:00-03:00`);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(toSaoPauloDay(d), 0);
  }

  for (const iso of dates) {
    const day = toSaoPauloDay(new Date(iso));
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }

  return Array.from(buckets, ([date, count]) => ({ date, count }));
}

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

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const [
    { count: totalEmpresas },
    { count: totalProfissionais },
    { count: totalVagas },
    { count: totalCandidaturas },
    { count: totalCadastros },
    { data: profiles, count: totalPageCount },
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("professionals").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, email, tipo, criado_em", { count: "exact" })
      .order("criado_em", { ascending: false })
      .range(from, to),
  ]);

  const chartSince = new Date();
  chartSince.setHours(0, 0, 0, 0);
  chartSince.setDate(chartSince.getDate() - (CHART_DAYS - 1));
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("criado_em")
    .gte("criado_em", chartSince.toISOString());
  const dailySignups = bucketByDay((recentProfiles ?? []).map((p) => p.criado_em), CHART_DAYS);

  const stats = [
    { label: "Total de cadastros", value: totalCadastros ?? 0, color: "bg-gray-100 text-gray-700" },
    { label: "Empresas", value: totalEmpresas ?? 0, color: "bg-rose-50 text-rose-600" },
    { label: "Profissionais", value: totalProfissionais ?? 0, color: "bg-blue-50 text-blue-600" },
    { label: "Vagas", value: totalVagas ?? 0, color: "bg-green-50 text-green-600" },
    { label: "Candidaturas", value: totalCandidaturas ?? 0, color: "bg-purple-50 text-purple-600" },
  ];

  // Cruza os cadastros da página com companies/professionals para saber tipo, nome e cidade/estado
  const profileIds = (profiles ?? []).map((p) => p.id);
  const [{ data: companiesByUser }, { data: professionalsByUser }] = await Promise.all([
    supabase.from("companies").select("user_id, nome_estabelecimento, cidade, estado, status_cadastro")
      .in("user_id", profileIds.length ? profileIds : [""]),
    supabase.from("professionals").select("user_id, nome, cidade, estado, funcoes, funcao_outro, slug")
      .in("user_id", profileIds.length ? profileIds : [""]),
  ]);

  const cadastros = (profiles ?? []).map((profile) => {
    const company = companiesByUser?.find((c) => c.user_id === profile.id);
    const professional = professionalsByUser?.find((p) => p.user_id === profile.id);

    let nome = profile.email;
    let tipo: "empresa" | "profissional" | "incompleto" = "incompleto";
    let cidadeEstado = "—";
    let profissao = "—";

    if (company?.status_cadastro === "completo") {
      nome = company.nome_estabelecimento;
      tipo = "empresa";
      cidadeEstado = [company.cidade, company.estado].filter(Boolean).join(" - ") || "—";
    } else if (professional?.slug) {
      nome = professional.nome;
      tipo = "profissional";
      cidadeEstado = [professional.cidade, professional.estado].filter(Boolean).join(" - ") || "—";
      profissao = (professional.funcoes ?? [])
        .map((f: string) => (f === "outro" ? (professional.funcao_outro || "Outro") : f))
        .join(", ") || "—";
    }

    return { id: profile.id, nome, tipo, cidadeEstado, profissao, criado_em: profile.criado_em };
  });

  const totalPages = Math.max(1, Math.ceil((totalPageCount ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">Visão geral</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      <DailySignupsChart data={dailySignups} />

      {/* Lista única de cadastros, paginada */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Cadastros</h2>
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.nome}</p>
                  <p className="text-xs text-gray-400">{c.cidadeEstado}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{label}</span>
                  <span className="text-xs text-gray-400 w-28 text-right truncate">{c.profissao}</span>
                  <span className="text-xs text-gray-400 w-20 text-right">{formatRelativeTime(c.criado_em)}</span>
                </div>
              </div>
            );
          })}
          {cadastros.length === 0 && <p className="text-sm text-gray-400 px-4 py-4">Nenhum cadastro ainda.</p>}
        </div>

        {/* Paginação */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <Link
            href={`/admin?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={`px-3 py-1.5 rounded-lg border border-gray-200 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
          >
            Anterior
          </Link>
          <span className="text-gray-500">Página {page} de {totalPages}</span>
          <Link
            href={`/admin?page=${page + 1}`}
            aria-disabled={page >= totalPages}
            className={`px-3 py-1.5 rounded-lg border border-gray-200 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
          >
            Próxima
          </Link>
        </div>
      </div>
    </div>
  );
}
