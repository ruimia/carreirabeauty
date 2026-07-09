export const metadata = { title: "Cadastro — Empresa" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EmpresaOnboarding from "./EmpresaOnboarding";
import { getCategorias } from "@/lib/config";

function getInitialStep(company: Record<string, unknown> | null): number {
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: company }, categorias] = await Promise.all([
    supabase.from("companies").select("*").eq("user_id", user.id).maybeSingle(),
    getCategorias(),
  ]);

  if (company?.status_cadastro === "completo") redirect("/dashboard/empresa");

  return (
    <EmpresaOnboarding
      companyId={company?.id ?? null}
      initialStep={getInitialStep(company as Record<string, unknown> | null)}
      initialData={company ?? {}}
      userId={user.id}
      categorias={categorias}
    />
  );
}
