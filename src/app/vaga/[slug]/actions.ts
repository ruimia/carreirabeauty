"use server";

import { createClient } from "@/lib/supabase/server";
import { emailNovaCandidatura } from "@/lib/email";

export async function candidatar(jobId: string, mensagem: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: prof } = await supabase
    .from("professionals")
    .select("id, nome")
    .eq("user_id", user.id)
    .single();
  if (!prof) throw new Error("Perfil profissional não encontrado");

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
