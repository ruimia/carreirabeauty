import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfissionalOnboarding from "./ProfissionalOnboarding";

function getInitialStep(p: Record<string, string | null> | null): number {
  if (!p) return 1;
  if (!p.nome || !p.telefone) return 1;
  if (!p.funcao) return 2;
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

  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (professional?.slug) redirect("/dashboard/profissional");

  const initialStep = getInitialStep(professional as Record<string, string | null> | null);

  return (
    <ProfissionalOnboarding
      professionalId={professional?.id ?? null}
      initialStep={initialStep}
      initialData={professional ?? {}}
      userId={user.id}
    />
  );
}
