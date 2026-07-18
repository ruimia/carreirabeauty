"use server";

// Processa ~30 cidades chamando a API da Adzuna uma a uma — leva bem mais
// que o timeout padrão de função serverless (10s no plano atual), por isso
// precisa desse teto maior.
export const maxDuration = 60;

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { atualizarVagasExternas, StatsAtualizacaoAdzuna } from "@/lib/adzuna";

export async function rodarAtualizacaoAdzuna(): Promise<StatsAtualizacaoAdzuna & { erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Acesso negado");

  // vagas_externas só tem policy de SELECT — escrita precisa da service role
  // (mesmo padrão do script scripts/fetch-vagas-adzuna.mjs)
  const supabaseService = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const iniciadoEm = new Date().toISOString();

  try {
    const stats = await atualizarVagasExternas(supabaseService);
    await supabaseService.from("vagas_externas_atualizacoes").insert({
      iniciado_em: iniciadoEm,
      concluido_em: new Date().toISOString(),
      cidades_processadas: stats.cidadesProcessadas,
      chamadas_api: stats.chamadasApi,
      vagas_encontradas: stats.vagasEncontradas,
      erro: stats.erros.length > 0 ? stats.erros.join(" | ") : null,
      executado_por: user.id,
    });
    return stats;
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : "Erro desconhecido";
    await supabaseService.from("vagas_externas_atualizacoes").insert({
      iniciado_em: iniciadoEm,
      concluido_em: new Date().toISOString(),
      erro: mensagem,
      executado_por: user.id,
    });
    return { cidadesProcessadas: 0, chamadasApi: 0, vagasEncontradas: 0, erros: [mensagem], erro: mensagem };
  }
}
