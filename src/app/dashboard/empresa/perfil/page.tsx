export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilEmpresaForm from "./PerfilEmpresaForm";

export default async function PerfilEmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/onboarding/empresa");

  return <PerfilEmpresaForm company={company} />;
}
