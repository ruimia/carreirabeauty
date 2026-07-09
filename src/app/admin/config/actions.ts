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

export async function addProfissao(nome: string) {
  const supabase = await assertAdmin();
  const max = await supabase.from("profissoes").select("ordem").order("ordem", { ascending: false }).limit(1).maybeSingle();
  const ordem = (max.data?.ordem ?? 0) + 1;
  await supabase.from("profissoes").insert({ nome: nome.trim(), ordem });
  revalidatePath("/admin/config");
}

export async function toggleProfissao(id: string, ativo: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("profissoes").update({ ativo }).eq("id", id);
  revalidatePath("/admin/config");
}

export async function renameProfissao(id: string, nome: string) {
  const supabase = await assertAdmin();
  await supabase.from("profissoes").update({ nome: nome.trim() }).eq("id", id);
  revalidatePath("/admin/config");
}

export async function deleteProfissao(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("profissoes").delete().eq("id", id);
  revalidatePath("/admin/config");
}

export async function addCategoriaNegocio(nome: string) {
  const supabase = await assertAdmin();
  const max = await supabase.from("categorias_negocio").select("ordem").order("ordem", { ascending: false }).limit(1).maybeSingle();
  const ordem = (max.data?.ordem ?? 0) + 1;
  await supabase.from("categorias_negocio").insert({ nome: nome.trim(), ordem });
  revalidatePath("/admin/config");
}

export async function toggleCategoriaNegocio(id: string, ativo: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("categorias_negocio").update({ ativo }).eq("id", id);
  revalidatePath("/admin/config");
}

export async function renameCategoriaNegocio(id: string, nome: string) {
  const supabase = await assertAdmin();
  await supabase.from("categorias_negocio").update({ nome: nome.trim() }).eq("id", id);
  revalidatePath("/admin/config");
}

export async function deleteCategoriaNegocio(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("categorias_negocio").delete().eq("id", id);
  revalidatePath("/admin/config");
}

export async function addHabilidade(nome: string) {
  const supabase = await assertAdmin();
  const max = await supabase.from("habilidades").select("ordem").order("ordem", { ascending: false }).limit(1).maybeSingle();
  const ordem = (max.data?.ordem ?? 0) + 1;
  await supabase.from("habilidades").insert({ nome: nome.trim(), ordem });
  revalidatePath("/admin/config");
}

export async function toggleHabilidade(id: string, ativo: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("habilidades").update({ ativo }).eq("id", id);
  revalidatePath("/admin/config");
}

export async function renameHabilidade(id: string, nome: string) {
  const supabase = await assertAdmin();
  await supabase.from("habilidades").update({ nome: nome.trim() }).eq("id", id);
  revalidatePath("/admin/config");
}

export async function deleteHabilidade(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("habilidades").delete().eq("id", id);
  revalidatePath("/admin/config");
}
