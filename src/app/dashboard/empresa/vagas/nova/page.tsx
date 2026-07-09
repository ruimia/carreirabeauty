export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NovaVagaForm from "./NovaVagaForm";
import { getProfissoes } from "@/lib/config";

export default async function NovaVagaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: company }, profissoes] = await Promise.all([
    supabase.from("companies").select("id, endereco, cidade, estado, cep").eq("user_id", user.id).single(),
    getProfissoes(),
  ]);

  if (!company) redirect("/onboarding/empresa");

  return <NovaVagaForm company={company} profissoes={profissoes} />;
}
