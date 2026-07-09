export const dynamic = "force-dynamic";

export const metadata = { title: "Nova vaga" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NovaVagaForm from "./NovaVagaForm";
import { getProfissoes } from "@/lib/config";

export default async function NovaVagaPage() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) return <pre style={{ padding: 24, color: "red" }}>auth error: {authError.message}</pre>;
    if (!user) redirect("/login");

    const [companyRes, profissoes] = await Promise.all([
      supabase.from("companies").select("id, endereco, cidade, estado, cep, logo_url").eq("user_id", user.id).maybeSingle(),
      getProfissoes().catch((e: unknown) => { console.error("getProfissoes:", e); return [] as string[]; }),
    ]);

    if (companyRes.error) {
      return <pre style={{ padding: 24, color: "red" }}>company error: {JSON.stringify(companyRes.error)}</pre>;
    }

    const company = companyRes.data;
    if (!company) redirect("/onboarding/empresa");

    return <NovaVagaForm company={company} profissoes={profissoes} />;
  } catch (e: unknown) {
    const isRedirect = e instanceof Error && e.message === "NEXT_REDIRECT";
    if (isRedirect) throw e;
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    return <pre style={{ padding: 24, color: "red", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{msg}</pre>;
  }
}
