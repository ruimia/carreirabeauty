import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const PLANO_KEY_MAP: Record<string, { plano: string; tabela: "companies" | "professionals" }> = {
  empresa_premium:  { plano: "premium", tabela: "companies" },
  profissional_pro: { plano: "pro",     tabela: "professionals" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP envia tipo "subscription_preapproval" para assinaturas
    if (body.type !== "subscription_preapproval") {
      return NextResponse.json({ ok: true });
    }

    const preapprovalId = body.data?.id;
    if (!preapprovalId) return NextResponse.json({ ok: true });

    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const preApproval = new PreApproval(mp);
    const subscription = await preApproval.get({ id: preapprovalId });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any;
    const planId: string = sub.preapproval_plan_id ?? "";
    const payerEmail: string = sub.payer_email ?? "";
    const status = subscription.status;
    const ativo = status === "authorized";

    // Descobre qual plano pelo plan_id
    const MP_PLAN_IDS: Record<string, string> = {
      [process.env.MP_PLAN_EMPRESA_PREMIUM  ?? ""]: "empresa_premium",
      [process.env.MP_PLAN_PROFISSIONAL_PRO ?? ""]: "profissional_pro",
    };

    const planoKey = MP_PLAN_IDS[planId];
    if (!planoKey) return NextResponse.json({ ok: true });

    const mapa = PLANO_KEY_MAP[planoKey];
    if (!mapa) return NextResponse.json({ ok: true });

    const validade = ativo ? (() => {
      const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString();
    })() : null;

    const supabase = await createClient();

    // Encontra user_id pelo email
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("email", payerEmail).maybeSingle();
    if (!profile) return NextResponse.json({ ok: true });

    await supabase
      .from(mapa.tabela)
      .update({
        plano: ativo ? mapa.plano : "gratis",
        plano_status: ativo ? "ativo" : "cancelado",
        plano_validade: validade,
        mp_subscription_id: preapprovalId,
      })
      .eq("user_id", profile.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[MP webhook]", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
