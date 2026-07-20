"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailNovaCandidatura } from "@/lib/email";
import { limiteCandidaturasMes } from "@/lib/planos";
import { saoPauloStartOfMonthISO } from "@/lib/timezone";

type CandidatarResult =
  | { ok: true; jaAplicou: boolean; totalCandidatos: number; isPro: boolean }
  | { ok: false; error: "NAO_AUTENTICADO" | "PERFIL_NAO_ENCONTRADO" | "LIMITE_PLANO" | "ERRO_DB" };

export async function candidatar(jobId: string, mensagem: string | null): Promise<CandidatarResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "NAO_AUTENTICADO" };

  const { data: prof } = await supabase
    .from("professionals")
    .select("id, nome, plano")
    .eq("user_id", user.id)
    .single();
  if (!prof) return { ok: false, error: "PERFIL_NAO_ENCONTRADO" };

  // Checa limite de candidaturas do mês
  const limite = limiteCandidaturasMes(prof.plano ?? "gratis");
  if (limite !== null) {
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", prof.id)
      .gte("criado_em", saoPauloStartOfMonthISO());
    if ((count ?? 0) >= limite) return { ok: false, error: "LIMITE_PLANO" };
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    professional_id: prof.id,
    mensagem: mensagem || null,
  });

  // Contagem de candidatos da vaga — usada na tela de confirmação pra mostrar
  // a concorrência real e motivar a se destacar (PRO/certificados/perfil).
  // Precisa do client admin: a RLS de applications só deixa o profissional ver
  // as PRÓPRIAS candidaturas, então contar pelo client de sessão sempre dá 1,
  // mesmo com dezenas de outros candidatos na mesma vaga. Só o total agregado
  // é exposto aqui — nenhum dado pessoal de outros candidatos.
  async function contarCandidatos() {
    const admin = createAdminClient();
    const { count } = await admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId);
    return count ?? 1;
  }

  if (error) {
    if (error.code === "23505") return { ok: true, jaAplicou: true, totalCandidatos: await contarCandidatos(), isPro: prof.plano === "pro" };
    return { ok: false, error: "ERRO_DB" };
  }

  // Busca dados da vaga e empresa para o email.
  // Usa o client admin (service role) porque RLS de companies/profiles só permite
  // que cada usuário veja a própria linha — o profissional não tem acesso de leitura
  // aos dados da empresa dona da vaga.
  const admin = createAdminClient();
  const { data: job } = await admin
    .from("jobs")
    .select("id, titulo, funcao, funcao_outro, company_id")
    .eq("id", jobId)
    .single();

  if (job) {
    const { data: company } = await admin
      .from("companies")
      .select("user_id, nome_estabelecimento")
      .eq("id", job.company_id)
      .single();

    if (company) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("id", company.user_id)
        .single();

      if (profile?.email) {
        await emailNovaCandidatura({
          empresaEmail: profile.email,
          empresaNome: company.nome_estabelecimento ?? "",
          profissionalNome: prof.nome ?? "",
          funcaoVaga: job.funcao === "outro" ? (job.funcao_outro ?? "Outro") : (job.funcao ?? ""),
          tituloVaga: job.titulo ?? "",
          mensagem: mensagem,
          jobId: job.id,
        }).catch(() => {}); // não bloqueia se email falhar
      }
    }
  }

  return { ok: true, jaAplicou: false, totalCandidatos: await contarCandidatos(), isPro: prof.plano === "pro" };
}
