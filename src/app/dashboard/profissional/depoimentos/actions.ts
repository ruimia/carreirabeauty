"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function moderarDepoimento(depoimentoId: string, status: "aprovado" | "rejeitado") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("depoimentos").update({ status }).eq("id", depoimentoId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/profissional/depoimentos");
}
