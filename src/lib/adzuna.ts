import { SupabaseClient } from "@supabase/supabase-js";

// Mesma lógica de scripts/fetch-vagas-adzuna.mjs, portada pra TS pra rodar
// dentro de uma Server Action (botão manual no admin) — ver seção 7.6.5/
// Fase 6.5 do doc do projeto.

const TERMOS_BELEZA = [
  "cabeleireiro", "cabeleireira", "manicure", "pedicure", "esteticista",
  "maquiador", "maquiadora", "barbeiro", "massoterapeuta", "sobrancelhas",
  "cilios", "depilador", "depiladora", "podologo",
  "recepcionista", "auxiliar", "assistente",
].join(" ");

const NUCLEO_BELEZA = [
  "cabeleir", "manicur", "pedicur", "esteticist", "estetica", "maquiad",
  "barbeir", "massoterap", "massagem", "sobrancel", "cilio", "depilad",
  "podolog", "spa", "beleza", "cabelo", "unha", "nail",
];

const UF_POR_NOME: Record<string, string> = {
  "acre": "AC", "alagoas": "AL", "amapa": "AP", "amazonas": "AM", "bahia": "BA",
  "ceara": "CE", "distrito federal": "DF", "espirito santo": "ES", "goias": "GO",
  "maranhao": "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
  "minas gerais": "MG", "para": "PA", "paraiba": "PB", "parana": "PR",
  "pernambuco": "PE", "piaui": "PI", "rio de janeiro": "RJ",
  "rio grande do norte": "RN", "rio grande do sul": "RS", "rondonia": "RO",
  "roraima": "RR", "santa catarina": "SC", "sao paulo": "SP", "sergipe": "SE",
  "tocantins": "TO",
};

const RAIO_KM = 30;

function normaliza(s: string | null | undefined) {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function contemTermo(texto: string, termo: string) {
  return new RegExp(`\\b${termo}`).test(texto);
}

function temNucleoBeleza(texto: string | null | undefined) {
  const t = normaliza(texto);
  return NUCLEO_BELEZA.some((p) => contemTermo(t, p));
}

function siglaEstado(nomeCompleto: string | undefined) {
  const chave = normaliza(nomeCompleto).replace(/^estado d[eo]\s+/, "").trim();
  return UF_POR_NOME[chave] ?? nomeCompleto;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ehVagaDeBeleza(v: any) {
  return temNucleoBeleza(v.title);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function localizacaoReal(v: any, cidadeBusca: string, estadoBusca: string) {
  const area: string[] = v.location?.area ?? [];
  const cidade = area[area.length - 1];
  const estado = siglaEstado(area[area.length - 2]);
  return { cidade: cidade || cidadeBusca, estado: estado || estadoBusca };
}

async function buscarVagasAdzuna(cidade: string, appId: string, appKey: string) {
  const url = new URL("https://api.adzuna.com/v1/api/jobs/br/search/1");
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("what_or", TERMOS_BELEZA);
  url.searchParams.set("where", cidade);
  url.searchParams.set("distance", String(RAIO_KM));
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    // Erros da Adzuna (ex: 503) às vezes retornam uma página HTML inteira —
    // trunca pra manter o log legível
    const texto = (await res.text()).replace(/\s+/g, " ").trim().slice(0, 150);
    return { results: [], erro: `${res.status} ${texto}` };
  }
  const json = await res.json();
  return { results: json.results ?? [] };
}

export interface StatsAtualizacaoAdzuna {
  cidadesProcessadas: number;
  chamadasApi: number;
  vagasEncontradas: number;
  erros: string[];
}

export async function atualizarVagasExternas(supabase: SupabaseClient): Promise<StatsAtualizacaoAdzuna> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Faltam ADZUNA_APP_ID / ADZUNA_APP_KEY nas variáveis de ambiente.");
  }

  const { data: profissionais, error: errProf } = await supabase
    .from("professionals")
    .select("cidade, estado")
    .not("cidade", "eq", "")
    .not("slug", "is", null);
  if (errProf) throw errProf;

  const vistos = new Set<string>();
  const cidades: { cidade: string; estado: string }[] = [];
  for (const p of profissionais ?? []) {
    const cidade = (p.cidade ?? "").trim();
    const estado = (p.estado ?? "").trim();
    if (!cidade) continue;
    const chave = `${cidade}|${estado}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    cidades.push({ cidade, estado });
  }

  let vagasEncontradas = 0;
  const erros: string[] = [];

  for (const { cidade, estado } of cidades) {
    const { results: brutas, erro } = await buscarVagasAdzuna(cidade, appId, appKey);
    if (erro) { erros.push(`${cidade}: ${erro}`); continue; }

    const vagas = brutas.filter(ehVagaDeBeleza);
    vagasEncontradas += vagas.length;
    if (vagas.length === 0) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linhas = vagas.map((v: any) => {
      const { cidade: cidadeReal, estado: estadoReal } = localizacaoReal(v, cidade, estado);
      return {
        fonte: "adzuna",
        external_id: String(v.id),
        cidade_busca: cidade,
        titulo: v.title,
        empresa: v.company?.display_name ?? null,
        cidade: cidadeReal,
        estado: estadoReal,
        url: v.redirect_url,
        descricao: v.description ?? null,
        salario_min: v.salary_min ?? null,
        salario_max: v.salary_max ?? null,
        publicado_em: v.created ?? null,
        categoria: v.category?.label ?? null,
        atualizado_em: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from("vagas_externas").upsert(linhas, { onConflict: "fonte,external_id,cidade_busca" });
    if (error) erros.push(`${cidade}: erro ao salvar — ${error.message}`);
  }

  return {
    cidadesProcessadas: cidades.length,
    chamadasApi: cidades.length,
    vagasEncontradas,
    erros,
  };
}
