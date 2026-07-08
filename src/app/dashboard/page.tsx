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
    supabase.from("professionals").select("id, slug").eq("user_id", user.id).maybeSingle(),
  ]);

  if (company) {
    if (company.status_cadastro === "completo") {
      redirect("/dashboard/empresa");
    } else {
      redirect("/onboarding/empresa");
    }
  }

  if (professional) {
    if (professional.slug) {
      redirect("/dashboard/profissional");
    } else {
      redirect("/onboarding/profissional");
    }
  }

  // Verifica tipo no profile para evitar loop
  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo === "profissional") redirect("/onboarding/profissional");
  if (profile?.tipo === "empresa") redirect("/onboarding/empresa");

  redirect("/onboarding/tipo");
}
