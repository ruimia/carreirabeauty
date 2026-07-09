import { createClient } from "@/lib/supabase/server";

export async function getProfissoes(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profissoes").select("nome").eq("ativo", true).order("ordem");
  return data?.map((r) => r.nome) ?? [];
}

export async function getCategorias(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categorias_negocio").select("nome").eq("ativo", true).order("ordem");
  return data?.map((r) => r.nome) ?? [];
}
