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

  const [companyRes, profissoes] = await Promise.all([
    supabase.from("companies").select("id, endereco, cidade, estado, cep, logo_url").eq("user_id", user.id).maybeSingle(),
    getProfissoes().catch((e) => { console.error("getProfissoes error:", e); return [] as string[]; }),
  ]);

  if (companyRes.error) {
    console.error("company query error:", JSON.stringify(companyRes.error));
    return <div style={{ padding: 24, color: "red" }}>Erro ao carregar empresa: {companyRes.error.message}</div>;
  }

  const company = companyRes.data;
  if (!company) redirect("/onboarding/empresa");

  return <NovaVagaForm company={company} profissoes={profissoes} />;
}
