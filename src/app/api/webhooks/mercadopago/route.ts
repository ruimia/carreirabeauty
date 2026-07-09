import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const PLANO_KEY_MAP: Record<string, { plano: string; tabela: "companies" | "professionals" }> = {
  empresa_basic:    { plano: "basic",   tabela: "companies" },
  empresa_plus:     { plano: "plus",    tabela: "companies" },
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

    // external_reference = "tipo:userId:planoKey"
    const ref = subscription.external_reference ?? "";
    const [tipo, userId, planoKey] = ref.split(":");
    if (!tipo || !userId || !planoKey) return NextResponse.json({ ok: true });

    const mapa = PLANO_KEY_MAP[planoKey];
    if (!mapa) return NextResponse.json({ ok: true });

    const status = subscription.status; // authorized | paused | cancelled
    const ativo = status === "authorized";

    const validade = ativo ? (() => {
      const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString();
    })() : null;

    const supabase = await createClient();

    if (mapa.tabela === "companies") {
      await supabase
        .from("companies")
        .update({
          plano: ativo ? mapa.plano : "gratis",
          plano_status: ativo ? "ativo" : "cancelado",
          plano_validade: validade,
          mp_subscription_id: preapprovalId,
        })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("professionals")
        .update({
          plano: ativo ? mapa.plano : "gratis",
          plano_status: ativo ? "ativo" : "cancelado",
          plano_validade: validade,
          mp_subscription_id: preapprovalId,
        })
        .eq("user_id", userId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[MP webhook]", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
