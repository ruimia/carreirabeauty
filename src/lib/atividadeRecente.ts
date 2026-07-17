import { SupabaseClient } from "@supabase/supabase-js";

export interface EventoAtividade {
  tipo: "profissional" | "empresa";
  texto: string;
  criadoEm: string;
}

function iniciaisSobrenome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length < 2) return "";
  return ` ${partes[1][0].toUpperCase()}.`;
}

function localTexto(bairro: string | null, cidade: string | null, estado: string | null): string {
  const partes = [bairro, cidade].filter(Boolean).join(", ");
  if (!partes) return "";
  return estado ? `${partes} (${estado})` : partes;
}

// Feed de atividade real (seção 7.10) — só cadastros completos das últimas
// 24h, sem prova social fabricada. Some do ar sozinho quando não há nada
// recente, em vez de expor um dia de pouco movimento.
export async function getAtividadeRecente(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  limite = 8
): Promise<EventoAtividade[]> {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: profissionais }, { data: empresas }] = await Promise.all([
    supabase
      .from("professionals")
      .select("nome, funcoes, funcao_outro, bairro, cidade, estado, criado_em")
      .not("slug", "is", null)
      .gte("criado_em", desde)
      .order("criado_em", { ascending: false })
      .limit(limite),
    supabase
      .from("companies")
      .select("nome_estabelecimento, bairro, cidade, estado, criado_em")
      .eq("status_cadastro", "completo")
      .gte("criado_em", desde)
      .order("criado_em", { ascending: false })
      .limit(limite),
  ]);

  const eventos: EventoAtividade[] = [
    ...(profissionais ?? []).map((p): EventoAtividade => {
      const local = localTexto(p.bairro, p.cidade, p.estado);
      const nomeExibicao = `${p.nome.trim().split(/\s+/)[0]}${iniciaisSobrenome(p.nome)}`;
      const primeiraFuncao = p.funcoes?.[0];
      const funcaoLabel = primeiraFuncao === "Outro" ? p.funcao_outro : primeiraFuncao;
      const quem = funcaoLabel ? `${nomeExibicao}, ${funcaoLabel},` : nomeExibicao;
      return {
        tipo: "profissional",
        texto: local ? `${quem} de ${local} acabou de se cadastrar` : `${quem} acabou de se cadastrar`,
        criadoEm: p.criado_em,
      };
    }),
    ...(empresas ?? []).map((e): EventoAtividade => {
      const local = localTexto(e.bairro, e.cidade, e.estado);
      return {
        tipo: "empresa",
        texto: local ? `${e.nome_estabelecimento} se cadastrou em ${local}` : `${e.nome_estabelecimento} se cadastrou`,
        criadoEm: e.criado_em,
      };
    }),
  ];

  eventos.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  return eventos.slice(0, limite);
}
