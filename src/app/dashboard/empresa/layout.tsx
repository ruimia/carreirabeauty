export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Shell from "../Shell";

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("nome_estabelecimento, cidade, estado, logo_url, status_cadastro")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) redirect("/onboarding/tipo");
  if (company.status_cadastro !== "completo") redirect("/onboarding/empresa");

  return (
    <Shell
      role="empresa"
      userName={company.nome_estabelecimento}
      subtitle={`${company.cidade} · ${company.estado}`}
      logoUrl={company.logo_url ?? undefined}
    >
      {children}
    </Shell>
  );
}
