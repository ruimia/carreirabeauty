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

  const [{ data: certificados }, { data: depoimentosRows }] = await Promise.all([
    supabase.from("certificados").select("trilha_slug").eq("professional_id", professional.id),
    supabase.from("depoimentos").select("nome_cliente, estrelas, texto").eq("professional_id", professional.id).eq("status", "aprovado").order("criado_em", { ascending: false }),
  ]);

  return (
    <PerfilProfissionalForm
      professional={professional}
      email={user.email ?? ""}
      profissoes={profissoes}
      habilidades={habilidades ?? []}
      certificadosSlugs={(certificados ?? []).map((c) => c.trilha_slug)}
      depoimentos={(depoimentosRows ?? []).map((d) => ({ nomeCliente: d.nome_cliente, estrelas: d.estrelas, texto: d.texto }))}
    />
  );
}
