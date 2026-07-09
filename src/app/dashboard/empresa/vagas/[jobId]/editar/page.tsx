export const dynamic = "force-dynamic";
export const metadata = { title: "Editar vaga" };

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getProfissoes } from "@/lib/config";
import EditarVagaForm from "./EditarVagaForm";

export default async function EditarVagaPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: job }, { data: company }, profissoes] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", jobId).single(),
    supabase.from("companies").select("id, endereco, cidade, estado, cep, logo_url").eq("user_id", user.id).single(),
    getProfissoes(),
  ]);

  if (!job || !company) notFound();
  if (job.company_id !== company.id) notFound();

  return <EditarVagaForm job={job} company={company} profissoes={profissoes} />;
}
