"use server";

import { createClient } from "@/lib/supabase/server";
import { emailNovaCandidatura } from "@/lib/email";
import { limiteCandidaturasMes } from "@/lib/planos";

type CandidatarResult =
  | { ok: true; jaAplicou: boolean }
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
    const inicioMes = new Date();
    inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", prof.id)
      .gte("criado_em", inicioMes.toISOString());
    if ((count ?? 0) >= limite) return { ok: false, error: "LIMITE_PLANO" };
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    professional_id: prof.id,
    mensagem: mensagem || null,
  });

  if (error) {
    if (error.code === "23505") return { ok: true, jaAplicou: true };
    return { ok: false, error: "ERRO_DB" };
  }

  // Busca dados da vaga e empresa para o email
  const { data: job } = await supabase
    .from("jobs")
    .select("id, titulo, funcao, funcao_outro, company_id, companies(nome_estabelecimento)")
    .eq("id", jobId)
    .single();

  if (job) {
    const { data: companyProfile } = await supabase
      .from("profiles")
      .select("email")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("id", (job.companies as any)?.user_id ?? "")
      .maybeSingle();

    // busca user_id da empresa
    const { data: company } = await supabase
      .from("companies")
      .select("user_id, nome_estabelecimento")
      .eq("id", job.company_id)
      .single();

    if (company) {
      const { data: profile } = await supabase
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

  return { ok: true, jaAplicou: false };
}
