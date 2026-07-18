/**
 * Popula o cache de "Vagas Agregadas" (Fase 6.5 do doc do projeto) puxando
 * da Adzuna API, filtrado por raio de 30km em torno da cidade do profissional
 * (cobre região metropolitana/periferia) e por termos de beleza/estética/
 * bem-estar (escopo 100% vertical).
 *
 * Uso: node scripts/fetch-vagas-adzuna.mjs [--dry-run]
 *
 * Respeita o limite do plano free da Adzuna (25/min, 250/dia, 2.500/mês) —
 * roda periodicamente (cron), não é chamada em tempo real por usuário.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"(.*)"$/, "$1")];
    })
);

const APP_ID = env.ADZUNA_APP_ID;
const APP_KEY = env.ADZUNA_APP_KEY;
if (!APP_ID || !APP_KEY) {
  console.error("Faltam ADZUNA_APP_ID / ADZUNA_APP_KEY no .env.local. Crie uma conta grátis em https://developer.adzuna.com/ e adicione as chaves.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Termos de busca restritos a beleza/estética/bem-estar (escopo 100% vertical —
// decisão do doc do projeto, seção "NÃO expandir escopo"). Inclui recepcionista/
// auxiliar/assistente (genéricos) além dos termos específicos — o filtro de
// segurança abaixo garante que os genéricos só entram se o contexto de beleza
// aparecer também (título ou descrição), senão contaminaria com vaga de
// recepção/auxiliar de qualquer outro tipo de negócio.
const TERMOS_BELEZA = [
  "cabeleireiro", "cabeleireira", "manicure", "pedicure", "esteticista",
  "maquiador", "maquiadora", "barbeiro", "massoterapeuta", "sobrancelhas",
  "cilios", "depilador", "depiladora", "podologo",
  "recepcionista", "auxiliar", "assistente",
].join(" ");

// Núcleo: termos inequivocamente de beleza — presença sozinha no título já basta.
// "salão" sozinho fica de fora — é ambíguo demais ("salão de vendas" de
// supermercado, "salão de festas") — "beleza" já cobre "salão de beleza".
const NUCLEO_BELEZA = [
  "cabeleir", "manicur", "pedicur", "esteticist", "estetica", "maquiad",
  "barbeir", "massoterap", "massagem", "sobrancel", "cilio", "depilad",
  "podolog", "spa", "beleza", "cabelo", "unha", "nail",
];

function normaliza(s) {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// \b antes do termo evita falso positivo tipo "spa" dentro de "espaços" ou
// "cilio" dentro de outra palavra — só casa no início de uma palavra real
function contemTermo(texto, termo) {
  return new RegExp(`\\b${termo}`).test(texto);
}

function temNucleoBeleza(texto) {
  const t = normaliza(texto);
  return NUCLEO_BELEZA.some((p) => contemTermo(t, p));
}

function ehVagaDeBeleza(v) {
  const titulo = normaliza(v.title);
  // Termo genérico (recepcionista/auxiliar/assistente) só entra se o núcleo de
  // beleza também estiver no TÍTULO — checar a descrição deixava passar ruído
  // (ex: nome da agência de recrutamento mencionando "cabeleireiro" vazando
  // pra descrição de vaga de recepcionista de restaurante, sem relação real)
  return temNucleoBeleza(titulo);
}

async function buscarCidades() {
  const { data, error } = await supabase
    .from("professionals")
    .select("cidade, estado")
    .not("cidade", "eq", "")
    .not("slug", "is", null);
  if (error) throw error;

  const vistos = new Set();
  const cidades = [];
  for (const p of data) {
    const cidade = (p.cidade ?? "").trim();
    const estado = (p.estado ?? "").trim();
    if (!cidade) continue;
    const chave = `${cidade}|${estado}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    cidades.push({ cidade, estado });
  }
  return cidades;
}

// Raio (km) em torno da cidade do profissional — cobre região metropolitana/
// periferia sem precisar de geocoding próprio nem lista manual de cidades
// vizinhas. A Adzuna já geocodifica o "where" e filtra por distância real.
const RAIO_KM = 30;

// Uma única página de 50 mistura todas as profissões de beleza no mesmo
// resultado (busca é "cabeleireiro OU manicure OU esteticista OU..."), então
// profissões com menos vagas publicadas (ex: manicure) ficavam de fora quando
// profissões mais publicadas (ex: cabeleireiro) preenchiam as 50 posições.
// Busca 2 páginas por cidade (até 100 resultados) pra dar mais espaço.
const PAGINAS_POR_CIDADE = 2;

async function buscarPaginaAdzuna(cidade, pagina) {
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/br/search/${pagina}`);
  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("what_or", TERMOS_BELEZA);
  url.searchParams.set("where", cidade);
  url.searchParams.set("distance", String(RAIO_KM));
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`  ✗ erro Adzuna (${cidade}): ${res.status} ${await res.text()}`);
    return { results: [], count: 0 };
  }
  const json = await res.json();
  return { results: json.results ?? [], count: json.count ?? 0 };
}

async function buscarVagasAdzuna(cidade) {
  const todas = [];
  let totalDisponivel = 0;
  for (let pagina = 1; pagina <= PAGINAS_POR_CIDADE; pagina++) {
    const { results, count } = await buscarPaginaAdzuna(cidade, pagina);
    totalDisponivel = count;
    if (results.length === 0) break;
    todas.push(...results);
  }
  return { results: todas, count: totalDisponivel };
}

const UF_POR_NOME = {
  "acre": "AC", "alagoas": "AL", "amapa": "AP", "amazonas": "AM", "bahia": "BA",
  "ceara": "CE", "distrito federal": "DF", "espirito santo": "ES", "goias": "GO",
  "maranhao": "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
  "minas gerais": "MG", "para": "PA", "paraiba": "PB", "parana": "PR",
  "pernambuco": "PE", "piaui": "PI", "rio de janeiro": "RJ",
  "rio grande do norte": "RN", "rio grande do sul": "RS", "rondonia": "RO",
  "roraima": "RR", "santa catarina": "SC", "sao paulo": "SP", "sergipe": "SE",
  "tocantins": "TO",
};

function siglaEstado(nomeCompleto) {
  const chave = normaliza(nomeCompleto ?? "").replace(/^estado d[eo]\s+/, "").trim();
  return UF_POR_NOME[chave] ?? nomeCompleto;
}

// A vaga pode ser de uma cidade vizinha (raio), não da cidade-âncora buscada —
// usa a localização real devolvida pela Adzuna pra exibir corretamente,
// com fallback pra cidade-âncora se o parse falhar
function localizacaoReal(v, cidadeBusca, estadoBusca) {
  const area = v.location?.area ?? [];
  const cidade = area[area.length - 1];
  const estado = siglaEstado(area[area.length - 2]);
  return {
    cidade: cidade || cidadeBusca,
    estado: estado || estadoBusca,
  };
}

async function processarCidade(cidade, estado) {
  console.log(`📍 ${cidade}/${estado}`);
  const { results: brutas, count: totalDisponivel } = await buscarVagasAdzuna(cidade);
  const vagas = brutas.filter(ehVagaDeBeleza);
  console.log(`  ${brutas.length} vaga(s) na página (${totalDisponivel} no total pra essa busca), ${vagas.length} dentro do escopo de beleza`);

  if (DRY_RUN) {
    vagas.slice(0, 3).forEach((v) => console.log(`    - ${v.title} @ ${v.company?.display_name ?? "?"}`));
    return vagas.length;
  }

  if (vagas.length > 0) {
    const linhas = vagas.map((v) => {
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
    if (error) console.error(`  ✗ erro ao salvar: ${error.message}`);
    else console.log(`  ✓ salvo/atualizado`);
  }

  return vagas.length;
}

// Processa cidades em lotes concorrentes — sequencial estourava o tempo
// que a função serverless do botão manual do admin tem disponível
const TAMANHO_LOTE = 4;

async function main() {
  const cidades = await buscarCidades();
  console.log(`${cidades.length} cidade(s) com profissionais ativos:\n`);

  let totalVagas = 0;
  for (let i = 0; i < cidades.length; i += TAMANHO_LOTE) {
    const lote = cidades.slice(i, i + TAMANHO_LOTE);
    const resultados = await Promise.all(lote.map(({ cidade, estado }) => processarCidade(cidade, estado)));
    totalVagas += resultados.reduce((a, b) => a + b, 0);
  }

  console.log(`\n${DRY_RUN ? "DRY-RUN — nada foi salvo. " : ""}Total: ${totalVagas} vaga(s) em ${cidades.length} cidade(s).`);
}

main();
