import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MP_PLAN_IDS: Record<string, string> = {
  empresa_basic:    process.env.MP_PLAN_EMPRESA_BASIC    ?? "",
  empresa_plus:     process.env.MP_PLAN_EMPRESA_PLUS     ?? "",
  empresa_premium:  process.env.MP_PLAN_EMPRESA_PREMIUM  ?? "",
  profissional_pro: process.env.MP_PLAN_PROFISSIONAL_PRO ?? "",
};

export async function POST(req: NextRequest) {
  const { planoKey } = await req.json();

  const planId = MP_PLAN_IDS[planoKey];
  if (!planId) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("email").eq("id", user.id).single();

  // Tracking interno — fecha o funil (conteúdo PRO -> planos -> clique em assinar)
  await supabase.from("assinar_clicks").insert({ user_id: user.id, plano_key: planoKey });

  // Usa o init_point do plano diretamente — MP gerencia o checkout
  const url = new URL("https://www.mercadopago.com.br/subscriptions/checkout");
  url.searchParams.set("preapproval_plan_id", planId);
  if (profile?.email) url.searchParams.set("payer_email", profile.email);

  return NextResponse.json({ init_point: url.toString() });
}
