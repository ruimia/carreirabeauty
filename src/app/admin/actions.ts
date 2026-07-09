"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { emailVagaAprovada, emailVagaRejeitada } from "@/lib/email";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Acesso negado");
  return supabase;
}

export async function toggleBloqueioEmpresa(id: string, bloqueado: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("companies").update({ bloqueado }).eq("id", id);
  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${id}`);
}

export async function toggleBloqueadoProfissional(id: string, bloqueado: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("professionals").update({ bloqueado }).eq("id", id);
  revalidatePath("/admin/profissionais");
  revalidatePath(`/admin/profissionais/${id}`);
}

export async function updateJobStatus(id: string, status: string) {
  const supabase = await assertAdmin();
  await supabase.from("jobs").update({ status }).eq("id", id);
  revalidatePath("/admin/vagas");
}

export async function aprovarVaga(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("jobs").update({ status: "ativa", motivo_rejeicao: null }).eq("id", id);
  revalidatePath("/admin/vagas");

  const { data: job } = await supabase
    .from("jobs")
    .select("titulo, funcao, slug, company_id, companies(nome_estabelecimento, user_id)")
    .eq("id", id).single();

  if (job) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = job.companies as any;
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", comp?.user_id ?? "").single();
    if (profile?.email) {
      await emailVagaAprovada({
        empresaEmail: profile.email,
        empresaNome: comp?.nome_estabelecimento ?? "",
        tituloVaga: job.titulo || job.funcao || "Vaga",
        vagaSlug: job.slug ?? id,
      }).catch(() => {});
    }
  }
}

export async function rejeitarVaga(id: string, motivo: string) {
  const supabase = await assertAdmin();
  await supabase.from("jobs").update({ status: "rejeitada", motivo_rejeicao: motivo }).eq("id", id);
  revalidatePath("/admin/vagas");

  const { data: job } = await supabase
    .from("jobs")
    .select("titulo, funcao, company_id, companies(nome_estabelecimento, user_id)")
    .eq("id", id).single();

  if (job) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = job.companies as any;
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", comp?.user_id ?? "").single();
    if (profile?.email) {
      await emailVagaRejeitada({
        empresaEmail: profile.email,
        empresaNome: comp?.nome_estabelecimento ?? "",
        tituloVaga: job.titulo || job.funcao || "Vaga",
        motivo,
        jobId: id,
      }).catch(() => {});
    }
  }
}
