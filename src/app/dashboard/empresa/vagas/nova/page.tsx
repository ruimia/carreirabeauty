export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";

export default async function NovaVagaPage() {
  // step 1: criar client
  const supabase = await createClient();

  // step 2: pegar usuário
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) return <div style={{ padding: 24, color: "red" }}>auth error: {authError.message}</div>;
  if (!user) return <div style={{ padding: 24 }}>sem usuário</div>;

  // step 3: buscar empresa
  const { data: company, error: companyErr } = await supabase
    .from("companies")
    .select("id, endereco, cidade, estado, cep, logo_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (companyErr) return <div style={{ padding: 24, color: "red" }}>company err: {companyErr.message} / code: {companyErr.code}</div>;
  if (!company) return <div style={{ padding: 24 }}>empresa não encontrada</div>;

  return <div style={{ padding: 24 }}>✅ step 3 OK — empresa: {company.id}</div>;
}
