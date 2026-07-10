export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Shell from "../Shell";

export default async function ProfissionalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("nome, funcoes, funcao_outro, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!professional) redirect("/onboarding/tipo");
  if (!professional.slug) redirect("/onboarding/profissional");

  const funcaoLabel = professional.funcoes?.length
    ? professional.funcoes.map((f: string) => f === "Outro" ? (professional.funcao_outro || "Outro") : f).join(", ")
    : "—";

  return (
    <Shell
      role="profissional"
      userName={professional.nome}
      subtitle={funcaoLabel}
    >
      {children}
    </Shell>
  );
}
