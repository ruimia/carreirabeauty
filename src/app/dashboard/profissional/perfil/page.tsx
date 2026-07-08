export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilProfissionalForm from "./PerfilProfissionalForm";

export default async function PerfilProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!professional) redirect("/onboarding/profissional");

  return <PerfilProfissionalForm professional={professional} email={user.email ?? ""} />;
}
