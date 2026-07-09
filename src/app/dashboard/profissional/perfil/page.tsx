export const dynamic = "force-dynamic";

export const metadata = { title: "Meu perfil" };
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilProfissionalForm from "./PerfilProfissionalForm";
import { getProfissoes } from "@/lib/config";

export default async function PerfilProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: professional }, profissoes, { data: habilidades }] = await Promise.all([
    supabase.from("professionals").select("*").eq("user_id", user.id).single(),
    getProfissoes(),
    supabase.from("habilidades").select("nome, profissao").eq("ativo", true).order("profissao, ordem"),
  ]);

  if (!professional) redirect("/onboarding/profissional");

  return (
    <PerfilProfissionalForm
      professional={professional}
      email={user.email ?? ""}
      profissoes={profissoes}
      habilidades={habilidades ?? []}
    />
  );
}
