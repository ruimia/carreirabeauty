"use server";

import { createClient } from "@/lib/supabase/server";
import { emailNovaCandidatura } from "@/lib/email";
import { limiteCandidaturasMes } from "@/lib/planos";

export async function candidatar(jobId: string, mensagem: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: prof } = await supabase
    .from("professionals")
    .select("id, nome, plano")
    .eq("user_id", user.id)
    .single();
  if (!prof) throw new Error("Perfil profissional não encontrado");

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
    if ((count ?? 0) >= limite) throw new Error("LIMITE_PLANO");
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    professional_id: prof.id,
    mensagem: mensagem || null,
  });

  if (error) {
    if (error.code === "23505") return { jaAplicou: true };
    throw new Error(error.message);
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

  return { jaAplicou: false };
}
