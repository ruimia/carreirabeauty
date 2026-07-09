export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilProfissionalForm from "./PerfilProfissionalForm";
import { getProfissoes } from "@/lib/config";

export default async function PerfilProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: professional }, profissoes] = await Promise.all([
    supabase.from("professionals").select("*").eq("user_id", user.id).single(),
    getProfissoes(),
  ]);

  if (!professional) redirect("/onboarding/profissional");

  return <PerfilProfissionalForm professional={professional} email={user.email ?? ""} profissoes={profissoes} />;
}
