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

export async function atualizarPlanoEmpresa(companyId: string, plano: string) {
  const supabase = await assertAdmin();
  const validade = plano === "gratis" ? null : (() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString();
  })();
  await supabase.from("companies").update({
    plano,
    plano_status: "ativo",
    plano_validade: validade,
  }).eq("id", companyId);
  revalidatePath("/admin/assinaturas");
}

export async function atualizarPlanoProfissional(professionalId: string, plano: string) {
  const supabase = await assertAdmin();
  const validade = plano === "gratis" ? null : (() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString();
  })();
  await supabase.from("professionals").update({
    plano,
    plano_status: "ativo",
    plano_validade: validade,
  }).eq("id", professionalId);
  revalidatePath("/admin/assinaturas");
}
