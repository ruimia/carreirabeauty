import { SupabaseClient } from "@supabase/supabase-js";

// Mesma lógica de scripts/fetch-vagas-adzuna.mjs, portada pra TS pra rodar
// dentro de uma Server Action (botão manual no admin) — ver seção 7.6.5/
// Fase 6.5 do doc do projeto.

// Fisioterapeuta e Biomédico(a) apareceram na base de profissionais mas nunca
// entravam na busca — a Adzuna nunca era nem perguntada sobre essas vagas.
const TERMOS_BELEZA = [
  "cabeleireiro", "cabeleireira", "manicure", "pedicure", "esteticista",
  "maquiador", "maquiadora", "barbeiro", "massoterapeuta", "sobrancelhas",
  "cilios", "depilador", "depiladora", "podologo",
  "recepcionista", "auxiliar", "assistente",
  "fisioterapeuta", "biomedico", "biomedica",
].join(" ");

const NUCLEO_BELEZA = [
  "cabeleir", "manicur", "pedicur", "esteticist", "estetica", "maquiad",
  "barbeir", "massoterap", "massagem", "sobrancel", "cilio", "depilad",
  "podolog", "spa", "beleza", "cabelo", "unha", "nail",
  "fisioterap", "biomedic",
];

// Mesmas raízes usadas em src/app/dashboard/profissional/page.tsx pra casar
// vaga agregada com a função do profissional — reaproveitada aqui pra decidir
// quem precisa do fallback por bairro.
const RAIZES_FUNCAO = [
  "cabeleir", "hair", "manicur", "pedicur", "unha", "esteticist", "estetica",
  "maquiad", "barbeir", "barber", "massoterap", "massagem", "sobrancel",
  "cilio", "depilad", "podolog", "recepcion", "auxiliar", "assistente",
  "fisioterap", "biomedic",
];

const MINIMO_VAGAS_RELEVANTES = 5;
const RAIO_KM_FALLBACK = 60;

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

// Uma única página de 50 mistura todas as profissões de beleza no mesmo
// resultado (busca é "cabeleireiro OU manicure OU esteticista OU..."), então
// profissões com menos vagas publicadas (ex: manicure) ficavam de fora quando
// profissões mais publicadas (ex: cabeleireiro) preenchiam as 50 posições.
// Busca 2 páginas por cidade (até 100 resultados) pra dar mais espaço.
const PAGINAS_POR_CIDADE = 2;

async function buscarPaginaAdzuna(cidade: string, pagina: number, appId: string, appKey: string) {
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/br/search/${pagina}`);
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

async function buscarVagasAdzuna(cidade: string, appId: string, appKey: string) {
  // Páginas sequenciais dentro da mesma cidade — testado: paralelizar
  // página+cidade ao mesmo tempo (muitas requisições simultâneas) disparou
  // 429 (Too Many Requests) da Adzuna. Concorrência controlada acontece só
  // entre cidades (ver TAMANHO_LOTE), não dentro de uma cidade.
  const todas: unknown[] = [];
  let chamadas = 0;
  for (let pagina = 1; pagina <= PAGINAS_POR_CIDADE; pagina++) {
    const { results, erro } = await buscarPaginaAdzuna(cidade, pagina, appId, appKey);
    chamadas++;
    if (erro) return { results: todas, erro, chamadas };
    if (results.length === 0) break;
    todas.push(...results);
  }
  return { results: todas, erro: undefined as string | undefined, chamadas };
}

function palavrasDaFuncao(funcoes: string[] | null | undefined) {
  return (funcoes ?? []).flatMap((f) => {
    const fNorm = normaliza(f);
    return RAIZES_FUNCAO.filter((raiz) => contemTermo(fNorm, raiz));
  });
}

function contaVagasRelevantes(titulos: string[], funcoes: string[] | null | undefined) {
  const palavras = palavrasDaFuncao(funcoes);
  if (palavras.length === 0) return titulos.length; // sem função reconhecida, não filtra (mesma regra do dashboard)
  return titulos.filter((t) => palavras.some((p) => contemTermo(normaliza(t), p))).length;
}

export interface StatsAtualizacaoAdzuna {
  cidadesProcessadas: number;
  chamadasApi: number;
  vagasEncontradas: number;
  erros: string[];
  bairrosReforcados: number;
  vagasReforco: number;
}

export async function atualizarVagasExternas(supabase: SupabaseClient): Promise<StatsAtualizacaoAdzuna> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Faltam ADZUNA_APP_ID / ADZUNA_APP_KEY nas variáveis de ambiente.");
  }

  const { data: profissionais, error: errProf } = await supabase
    .from("professionals")
    .select("cidade, estado, bairro, funcoes")
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

  async function processarCidade({ cidade, estado }: { cidade: string; estado: string }) {
    const { results: brutas, erro, chamadas } = await buscarVagasAdzuna(cidade, appId!, appKey!);
    if (erro) return { vagasEncontradas: 0, chamadas, erro: `${cidade}: ${erro}` };

    const vagas = brutas.filter(ehVagaDeBeleza);
    if (vagas.length === 0) return { vagasEncontradas: 0, chamadas, erro: null };

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
    return {
      vagasEncontradas: vagas.length,
      chamadas,
      erro: error ? `${cidade}: erro ao salvar — ${error.message}` : null,
    };
  }

  // Processa várias cidades ao mesmo tempo (não uma por uma) — com 31+
  // cidades e 2 páginas cada, sequencial estourava o timeout da função
  // serverless que roda o botão manual do admin
  const TAMANHO_LOTE = 4;
  let vagasEncontradas = 0;
  let chamadasApi = 0;
  const erros: string[] = [];

  for (let i = 0; i < cidades.length; i += TAMANHO_LOTE) {
    const lote = cidades.slice(i, i + TAMANHO_LOTE);
    const resultados = await Promise.all(lote.map(processarCidade));
    for (const r of resultados) {
      vagasEncontradas += r.vagasEncontradas;
      chamadasApi += r.chamadas;
      if (r.erro) erros.push(r.erro);
    }
  }

  // Fallback por bairro/CEP: quando a cidade inteira não rendeu 5+ vagas
  // relevantes pra função do profissional, refaz a busca ancorada no bairro
  // dele (já resolvido a partir do CEP no cadastro) com raio maior.
  const vagasPorCidade = new Map<string, string[]>();
  for (const { cidade } of cidades) {
    const { data } = await supabase.from("vagas_externas").select("titulo").eq("cidade_busca", cidade);
    vagasPorCidade.set(cidade, (data ?? []).map((v) => v.titulo as string));
  }

  const bairrosNecessarios = new Map<string, { bairro: string; cidade: string; estado: string }>();
  for (const p of profissionais ?? []) {
    const bairro = (p.bairro ?? "").trim();
    const cidade = (p.cidade ?? "").trim();
    const estado = (p.estado ?? "").trim();
    if (!bairro || !cidade) continue;
    const relevantes = contaVagasRelevantes(vagasPorCidade.get(cidade) ?? [], p.funcoes);
    if (relevantes >= MINIMO_VAGAS_RELEVANTES) continue;
    const chave = `${bairro}|${cidade}|${estado}`;
    if (!bairrosNecessarios.has(chave)) bairrosNecessarios.set(chave, { bairro, cidade, estado });
  }

  const combos = [...bairrosNecessarios.values()];
  let vagasReforco = 0;

  async function processarBairro({ bairro, cidade, estado }: { bairro: string; cidade: string; estado: string }) {
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/br/search/1`);
    url.searchParams.set("app_id", appId!);
    url.searchParams.set("app_key", appKey!);
    url.searchParams.set("what_or", TERMOS_BELEZA);
    url.searchParams.set("where", `${bairro}, ${cidade}`);
    url.searchParams.set("distance", String(RAIO_KM_FALLBACK));
    url.searchParams.set("results_per_page", "50");
    url.searchParams.set("content-type", "application/json");

    const res = await fetch(url.toString());
    if (!res.ok) return { vagasEncontradas: 0, erro: `${bairro}, ${cidade}: ${res.status}` };
    const json = await res.json();
    const vagas = (json.results ?? []).filter(ehVagaDeBeleza);
    if (vagas.length === 0) return { vagasEncontradas: 0, erro: null };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linhas = vagas.map((v: any) => {
      const { cidade: cidadeReal, estado: estadoReal } = localizacaoReal(v, cidade, estado);
      return {
        fonte: "adzuna",
        external_id: String(v.id),
        cidade_busca: cidade, // chave que a home usa — reforço fica transparente
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
    return { vagasEncontradas: vagas.length, erro: error ? `${bairro}, ${cidade}: erro ao salvar — ${error.message}` : null };
  }

  for (let i = 0; i < combos.length; i += TAMANHO_LOTE) {
    const lote = combos.slice(i, i + TAMANHO_LOTE);
    const resultados = await Promise.all(lote.map(processarBairro));
    for (const r of resultados) {
      vagasReforco += r.vagasEncontradas;
      if (r.erro) erros.push(r.erro);
    }
  }

  return {
    cidadesProcessadas: cidades.length,
    chamadasApi,
    vagasEncontradas,
    erros,
    bairrosReforcados: combos.length,
    vagasReforco,
  };
}
