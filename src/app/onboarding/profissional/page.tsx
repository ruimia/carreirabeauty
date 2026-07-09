export const metadata = { title: "Cadastro — Profissional" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfissionalOnboarding from "./ProfissionalOnboarding";
import { getProfissoes } from "@/lib/config";

function getInitialStep(p: Record<string, unknown> | null): number {
  if (!p) return 1;
  if (!p.nome || !p.telefone) return 1;
  const funcoes = p.funcoes as string[] | null;
  if (!funcoes?.length && !p.funcao) return 2;
  if (!p.cidade) return 3;
  if (!p.experiencia) return 4;
  if (!p.disponibilidade) return 5;
  if (!p.pretensao_salarial) return 6;
  if (!p.educacao_basica) return 7;
  return 8;
}

export default async function OnboardingProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: professional }, profissoes] = await Promise.all([
    supabase.from("professionals").select("*").eq("user_id", user.id).maybeSingle(),
    getProfissoes(),
  ]);

  if (professional?.slug) redirect("/dashboard/profissional");

  return (
    <ProfissionalOnboarding
      professionalId={professional?.id ?? null}
      initialStep={getInitialStep(professional as Record<string, unknown> | null)}
      initialData={professional ?? {}}
      userId={user.id}
      profissoes={profissoes}
    />
  );
}
