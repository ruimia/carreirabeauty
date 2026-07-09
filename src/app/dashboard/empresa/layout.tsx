export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Shell from "../Shell";

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr) return <pre style={{ padding: 24, color: "red" }}>layout auth error: {authErr.message}</pre>;
    if (!user) redirect("/login");

    const { data: company, error: companyErr } = await supabase
      .from("companies")
      .select("nome_estabelecimento, cidade, estado, logo_url, status_cadastro")
      .eq("user_id", user.id)
      .maybeSingle();

    if (companyErr) return <pre style={{ padding: 24, color: "red" }}>layout company error: {JSON.stringify(companyErr)}</pre>;
    if (!company) redirect("/onboarding/tipo");
    if (company.status_cadastro !== "completo") redirect("/onboarding/empresa");

    return (
      <Shell
        role="empresa"
        userName={company.nome_estabelecimento}
        subtitle={`${company.cidade} · ${company.estado}`}
        logoUrl={company.logo_url ?? undefined}
      >
        {children}
      </Shell>
    );
  } catch (e: unknown) {
    const isRedirect = e != null && typeof e === "object" && "digest" in e && typeof (e as { digest: unknown }).digest === "string" && (e as { digest: string }).digest.startsWith("NEXT_REDIRECT");
    if (isRedirect) throw e;
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    return <pre style={{ padding: 24, color: "red", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{msg}</pre>;
  }
}
