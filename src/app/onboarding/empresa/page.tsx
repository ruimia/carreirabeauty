import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EmpresaOnboarding from "./EmpresaOnboarding";

function getInitialStep(company: Record<string, string | null> | null): number {
  if (!company) return 1;
  if (!company.cnpj) return 1;
  if (!company.nome_estabelecimento || !company.endereco) return 2;
  if (!company.responsavel) return 3;
  if (!company.telefone) return 4;
  if (!company.categoria_negocio) return 5;
  if (!company.faixa_funcionarios) return 6;
  return 7;
}

export default async function OnboardingEmpresaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (company?.status_cadastro === "completo") {
    redirect("/dashboard/empresa");
  }

  const initialStep = getInitialStep(company as Record<string, string | null> | null);

  return (
    <EmpresaOnboarding
      companyId={company?.id ?? null}
      initialStep={initialStep}
      initialData={company ?? {}}
      userId={user.id}
    />
  );
}
