"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function assertOwnsJob(jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: company } = await supabase
    .from("companies").select("id").eq("user_id", user.id).maybeSingle();
  if (!company) throw new Error("Empresa não encontrada");

  const { data: job } = await supabase
    .from("jobs").select("id").eq("id", jobId).eq("company_id", company.id).maybeSingle();
  if (!job) throw new Error("Vaga não encontrada");

  return supabase;
}

export async function encerrarVaga(jobId: string) {
  const supabase = await assertOwnsJob(jobId);
  await supabase.from("jobs").update({ status: "fechada" }).eq("id", jobId);
  revalidatePath("/dashboard/empresa");
}

export async function reabrirVaga(jobId: string) {
  const supabase = await assertOwnsJob(jobId);
  // Volta para ativa diretamente (já foi aprovada antes)
  await supabase.from("jobs").update({ status: "ativa" }).eq("id", jobId);
  revalidatePath("/dashboard/empresa");
}
