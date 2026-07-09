export const dynamic = "force-dynamic";

export const metadata = { title: "Perfil da empresa" };
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilEmpresaForm from "./PerfilEmpresaForm";
import { getCategorias } from "@/lib/config";

export default async function PerfilEmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: company }, categorias] = await Promise.all([
    supabase.from("companies").select("*").eq("user_id", user.id).single(),
    getCategorias(),
  ]);

  if (!company) redirect("/onboarding/empresa");

  return <PerfilEmpresaForm company={company} email={user.email ?? ""} categorias={categorias} />;
}
