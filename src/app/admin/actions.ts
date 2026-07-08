"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
