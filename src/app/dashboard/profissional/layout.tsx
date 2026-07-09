export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Shell from "../Shell";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

export default async function ProfissionalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("nome, funcao, funcao_outro, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!professional) redirect("/onboarding/tipo");
  if (!professional.slug) redirect("/onboarding/profissional");

  const funcaoLabel = professional.funcao === "outro"
    ? (professional.funcao_outro || "Outro")
    : (FUNCAO_LABEL[professional.funcao] ?? professional.funcao);

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
