"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getProfessionalId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: professional } = await supabase.from("professionals").select("id, plano").eq("user_id", user.id).single();
  if (!professional) throw new Error("Perfil não encontrado");
  return professional;
}

export async function registrarPreview(templateId: string) {
  const supabase = await createClient();
  const professional = await getProfessionalId(supabase);
  await supabase.from("template_eventos").insert({ professional_id: professional.id, template_id: templateId, tipo: "preview" });
}

export async function aplicarTemplate(templateId: string, ehTemplatePro: boolean) {
  const supabase = await createClient();
  const professional = await getProfessionalId(supabase);

  if (ehTemplatePro && professional.plano !== "pro") {
    await supabase.from("template_eventos").insert({ professional_id: professional.id, template_id: templateId, tipo: "paywall_hit" });
    return { ok: false as const, motivo: "paywall" as const };
  }

  const { error } = await supabase.from("professionals").update({ template_id: templateId }).eq("id", professional.id);
  if (error) return { ok: false as const, motivo: "erro" as const };

  await supabase.from("template_eventos").insert({ professional_id: professional.id, template_id: templateId, tipo: "aplicado" });
  revalidatePath("/dashboard/profissional/perfil");
  return { ok: true as const };
}
