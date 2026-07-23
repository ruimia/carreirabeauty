"use server";

import { revalidatePath } from "next/cache";

// /empresa/[slug] e a home usam ISR (revalidate 5min) — sem isso, uma edição
// de perfil da empresa ficaria com a versão antiga no ar por até 5 minutos.
export async function revalidarPerfilEmpresa(slug: string) {
  revalidatePath(`/empresa/${slug}`);
  revalidatePath("/");
}
