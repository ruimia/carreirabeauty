"use server";

import { revalidatePath } from "next/cache";

// /perfil/[slug] e a home usam ISR (revalidate 5min) — sem isso, uma edição
// de perfil (foto, portfólio, upgrade pra PRO) ficaria com a versão antiga
// no ar por até 5 minutos.
export async function revalidarPerfilProfissional(slug: string, slugAntigo?: string | null) {
  revalidatePath(`/perfil/${slug}`);
  if (slugAntigo && slugAntigo !== slug) revalidatePath(`/perfil/${slugAntigo}`);
  revalidatePath("/");
}
