export const dynamic = "force-dynamic";
export const metadata = { title: "Nova vaga" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NovaVagaForm from "./NovaVagaForm";
import { getProfissoes } from "@/lib/config";

export default async function NovaVagaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: company, error: companyErr }, profissoes] = await Promise.all([
    supabase.from("companies").select("id, endereco, cidade, estado, cep, logo_url").eq("user_id", user.id).maybeSingle(),
    getProfissoes().catch(() => [] as string[]),
  ]);

  if (companyErr) throw new Error(`company: ${companyErr.message}`);
  if (!company) redirect("/onboarding/empresa");

  return <NovaVagaForm company={company} profissoes={profissoes} />;
}
