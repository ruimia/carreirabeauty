"use server";

import { createClient } from "@/lib/supabase/server";
import { emailNovaVagaProfissional } from "@/lib/email";

export async function convidarPorEmail(profissionalUserId: string, jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: company } = await supabase
    .from("companies").select("id, nome_estabelecimento").eq("user_id", user.id).maybeSingle();
  if (!company) throw new Error("Empresa não encontrada");

  const { data: job } = await supabase
    .from("jobs").select("id, titulo, funcao, funcoes, slug")
    .eq("id", jobId).eq("company_id", company.id).single();
  if (!job) throw new Error("Vaga não encontrada");

  const { data: prof } = await supabase
    .from("professionals").select("nome, cidade").eq("user_id", profissionalUserId).single();
  if (!prof) throw new Error("Profissional não encontrado");

  const { data: email } = await supabase.rpc("email_para_convite", { profissional_user_id: profissionalUserId });
  if (!email) throw new Error("Não foi possível obter o email do profissional");

  const funcoesVaga = job.funcoes?.length ? job.funcoes : (job.funcao ? [job.funcao] : []);
  await emailNovaVagaProfissional({
    profissionalEmail: email,
    profissionalNome: prof.nome ?? "",
    tituloVaga: job.titulo || job.funcao || "Vaga",
    funcaoVaga: funcoesVaga.join(", "),
    empresaNome: company.nome_estabelecimento,
    cidade: prof.cidade ?? null,
    vagaSlug: job.slug ?? job.id,
  });

  return { ok: true };
}
