import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const MP_PLAN_IDS: Record<string, string> = {
  empresa_basic:    process.env.MP_PLAN_EMPRESA_BASIC    ?? "",
  empresa_plus:     process.env.MP_PLAN_EMPRESA_PLUS     ?? "",
  empresa_premium:  process.env.MP_PLAN_EMPRESA_PREMIUM  ?? "",
  profissional_pro: process.env.MP_PLAN_PROFISSIONAL_PRO ?? "",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://beta.carreirabeauty.com";

export async function POST(req: NextRequest) {
  try {
    const { planoKey } = await req.json();

    const planId = MP_PLAN_IDS[planoKey];
    if (!planId) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("email").eq("id", user.id).single();

    const tipo = planoKey.startsWith("empresa") ? "empresa" : "profissional";
    const backUrl = `${APP_URL}/dashboard/${tipo}/planos/sucesso`;

    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const preApproval = new PreApproval(mp);

    const result = await preApproval.create({
      body: {
        preapproval_plan_id: planId,
        payer_email: profile?.email ?? "",
        back_url: backUrl,
        external_reference: `${tipo}:${user.id}:${planoKey}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: undefined,
          currency_id: "BRL",
        },
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (e) {
    console.error("[MP assinar]", e);
    return NextResponse.json({ error: "Erro ao criar assinatura" }, { status: 500 });
  }
}
