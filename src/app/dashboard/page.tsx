import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verifica se já existe um registro de empresa ou profissional
  const [{ data: company }, { data: professional }] = await Promise.all([
    supabase.from("companies").select("id, status_cadastro").eq("user_id", user.id).maybeSingle(),
    supabase.from("professionals").select("id").eq("user_id", user.id).maybeSingle(),
  ]);

  if (company) {
    if (company.status_cadastro === "completo") {
      redirect("/dashboard/empresa");
    } else {
      redirect("/onboarding/empresa");
    }
  }

  if (professional) {
    // Fase 2 — por enquanto só mostra placeholder
    redirect("/dashboard/profissional");
  }

  // Nenhum registro → escolher tipo
  redirect("/onboarding/tipo");
}
